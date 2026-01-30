# Yet Another WOL Webapplication (YAWAPP)

## Features
- Fancy UI 🌟
- Mobile friendly 📱
- Optionally set a PIN to enter before sending WoL packet 🔐
- Configure servers easily via yaml file
- Easy deployment via `docker-compose.yaml`
- Build for Raspberry PI

## Inspiration
Electricity in germany is quite expensive 🥲 and of course, shutting down your homelab servers to save energy is always 
a good thing for the environment 🌍. 
Therefore, in my current homelab, I have a always-on RaspberryPI which I use to host this WebApp. Using a VPN tunnel, I 
can access `YAWAPP` and easily power on my servers via my phone

# Deploy 
## 1. Create a server.yaml file
```shell
nano server.yaml
```
```yaml
security:
  pin_required: true

servers:
  - name: "TrueNas Server"
    ip: "192.168.178.xx"
    mac: "AA:BB:CC:DD:EE:01"
    broadcast: "192.168.1.255"
  - name: "Proxmox Server"
    ip: "192.168.178.xx"
    mac: "AA:BB:CC:DD:EE:02"
    broadcast: "192.168.1.255"
```
## 2. Optionally create .env file
```shell
nano .env
```
```
YAWAPP_PIN = 1234
```

## 3. Create the docker-compose file
```shell
nano docker-compose.yaml
```
```yaml

```

## 4. Start it up 🥳
```shell
docker compose up -d
```

## 5. Optionally: Support me 🥺
- Star this repo 🌟
- If you are really happy, [buy me a coffee](buymeacoffee.com/manusimidt)
