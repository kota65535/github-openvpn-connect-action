# github-openvpn-connect-action

Github action for connecting to OpenVPN server.

## Inputs

### General Inputs
| Name | Description | Required |
| --- | --- | --- | 
| `config_file` | Location of OpenVPN client config file | yes |
| `dnshelper_script_file` | Location of Dns helper script file | Optional |

### Authentication Inputs

Supported authentication methods:
- Username & password auth
- Client certificate auth
- Both of them

| Name | Description | Required when | 
| --- | --- | --- | 
| `username` | Username | Username-password auth |
| `password` | Password | Username-password auth |
| `client_key` | Local peer's private key | Client certificate auth |
| `tls_auth_key` | Pre-shared secret for TLS-auth HMAC signature | Optional |


All authentication inputs should be provided by encrypted secrets environment variables.

## Usage 

- Create client configuration file based on the [official sample](https://github.com/OpenVPN/openvpn/blob/master/sample/sample-config-files/client.conf).
  It is recommended to use inline certificates to include them directly in configuration file like [this](https://github.com/kota65535/github-openvpn-connect-action/tree/master/.github/workflows/client.ovpn).

- If you need Dns resolution in your vpn, ubuntu vpn client is bad at dns option triggering, it's possible to use an helper
script in this case, for exemple [this one](https://github.com/jonathanio/update-systemd-resolved)
If you use it, warning, this file must be defined as executable in your repo (chmod +x).

- Usage in your workflow is like following:
```yaml
      - name: Checkout
        uses: actions/checkout@v2
      - name: Install OpenVPN
        run: sudo apt install -y openvpn openvpn-systemd-resolved
      - name: Connect to VPN
        uses: "kota65535/github-openvpn-connect-action@v1"
        with:
          config_file: ./github/workflows/client.ovpn
          dnshelper_script_file: ./github/workflows/update-systemd-resolved
          username: ${{ secrets.OVPN_USERNAME }}
          password: ${{ secrets.OVPN_PASSWORD }}
          client_key: ${{ secrets.OVPN_CLIENT_KEY }}
          tls_auth_key: ${{ secrets.OVPN_TLS_AUTH_KEY }}
      - name: Build something
        run: ./gradlew clean build
      # The openvpn process is automatically terminated in post-action phase
```
