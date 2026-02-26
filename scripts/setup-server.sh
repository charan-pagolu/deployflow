#!/bin/bash
# DeployFlow — one-shot Oracle Cloud VM setup
# Run once as the ubuntu user: bash setup-server.sh DUCKDNS_TOKEN DUCKDNS_SUBDOMAIN
# Example: bash setup-server.sh abc123 deployflow
set -e

DUCKDNS_TOKEN=${1:?"Usage: $0 DUCKDNS_TOKEN DUCKDNS_SUBDOMAIN"}
DUCKDNS_SUBDOMAIN=${2:?"Usage: $0 DUCKDNS_TOKEN DUCKDNS_SUBDOMAIN"}

echo "==> Updating system packages"
sudo apt-get update -q && sudo apt-get upgrade -y -q

# ── Docker ────────────────────────────────────────────────────────────────────
echo "==> Installing Docker"
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker ubuntu
sudo systemctl enable docker

# ── Docker Compose plugin ─────────────────────────────────────────────────────
echo "==> Installing Docker Compose plugin"
sudo apt-get install -y -q docker-compose-plugin

# ── Nginx + Certbot ───────────────────────────────────────────────────────────
echo "==> Installing Nginx and Certbot"
sudo apt-get install -y -q nginx certbot python3-certbot-nginx

# ── Clone repo ────────────────────────────────────────────────────────────────
echo "==> Cloning deployflow repo"
if [ ! -d ~/deployflow ]; then
    git clone https://github.com/charan-pagolu/deployflow.git ~/deployflow
else
    echo "   Repo already cloned, skipping"
fi

# ── Nginx config ──────────────────────────────────────────────────────────────
echo "==> Configuring Nginx"
sudo cp ~/deployflow/nginx/deployflow.conf /etc/nginx/sites-available/deployflow
sudo sed -i "s/YOUR_SUBDOMAIN/${DUCKDNS_SUBDOMAIN}/" /etc/nginx/sites-available/deployflow
sudo ln -sf /etc/nginx/sites-available/deployflow /etc/nginx/sites-enabled/deployflow
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx

# ── proxy.py systemd service ──────────────────────────────────────────────────
echo "==> Installing proxy.py as systemd service"
sudo tee /etc/systemd/system/deployflow-proxy.service > /dev/null <<EOF
[Unit]
Description=DeployFlow Supabase IPv6 Proxy
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/deployflow
ExecStart=/usr/bin/python3 /home/ubuntu/deployflow/proxy.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
sudo systemctl daemon-reload
sudo systemctl enable deployflow-proxy
sudo systemctl start deployflow-proxy

# ── DuckDNS cron (updates VM IP every 5 min) ─────────────────────────────────
echo "==> Setting up DuckDNS auto-update"
mkdir -p ~/duckdns
cat > ~/duckdns/duck.sh <<EOF
#!/bin/bash
echo url="https://www.duckdns.org/update?domains=${DUCKDNS_SUBDOMAIN}&token=${DUCKDNS_TOKEN}&ip=" | curl -k -o ~/duckdns/duck.log -K -
EOF
chmod +x ~/duckdns/duck.sh
~/duckdns/duck.sh  # run once immediately to register the IP
(crontab -l 2>/dev/null; echo "*/5 * * * * ~/duckdns/duck.sh >/dev/null 2>&1") | crontab -

echo ""
echo "============================================================"
echo "  Setup complete! Next steps:"
echo ""
echo "  1. Create .env in ~/deployflow:"
echo "     APP_NAME=DeployFlow"
echo "     VERSION=0.1.0"
echo "     DEBUG=False"
echo "     DATABASE_URL=postgresql+psycopg://postgres:YOUR_PASS@host.docker.internal:15432/postgres?sslmode=require"
echo ""
echo "  2. Open firewall ports in Oracle Cloud VCN ingress rules:"
echo "     TCP 22 (SSH), 80 (HTTP), 443 (HTTPS), 8000 (API)"
echo ""
echo "  3. Get HTTPS cert:"
echo "     sudo certbot --nginx -d ${DUCKDNS_SUBDOMAIN}.duckdns.org"
echo ""
echo "  4. Add GitHub secrets (Settings -> Secrets -> Actions):"
echo "     VM_HOST = $(curl -s ifconfig.me)"
echo "     VM_SSH_KEY = <paste your private key>"
echo ""
echo "  5. Push to main to trigger first deploy."
echo "============================================================"
