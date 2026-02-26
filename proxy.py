"""
Minimal TCP proxy: forwards container → host:15432 → Supabase IPv6:5432
Run on the host: python proxy.py
"""
import socket
import threading

LISTEN_HOST = "0.0.0.0"
LISTEN_PORT = 15432
TARGET_HOST = "2600:1f1c:f9:4d19:b90:c2a4:3a75:b364"
TARGET_PORT = 5432


def forward(src, dst):
    try:
        while chunk := src.recv(4096):
            dst.sendall(chunk)
    except Exception:
        pass
    finally:
        src.close()
        dst.close()


def handle(client):
    remote = socket.socket(socket.AF_INET6, socket.SOCK_STREAM)
    remote.connect((TARGET_HOST, TARGET_PORT))
    threading.Thread(target=forward, args=(client, remote), daemon=True).start()
    threading.Thread(target=forward, args=(remote, client), daemon=True).start()


server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server.bind((LISTEN_HOST, LISTEN_PORT))
server.listen(10)
print(f"Proxying 0.0.0.0:{LISTEN_PORT} -> [{TARGET_HOST}]:{TARGET_PORT}")

while True:
    client, addr = server.accept()
    threading.Thread(target=handle, args=(client,), daemon=True).start()
