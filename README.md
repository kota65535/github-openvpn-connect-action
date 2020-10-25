# github-openvpn-connect-action

Github action for connecting to OpenVPN server.

## Inputs

### General Inputs
| Name | Description | Required |
| --- | --- | --- | 
| `config_file` | Location of OpenVPN client config file | yes |

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

### Client Configuration File

Following certificates must be set in your client configuration file according to your authentication method.

- Username & password auth
  - CA certificate
- Client certificate auth
  - CA certificate
  - Client certificate

See example [client.ovpn](https://github.com/kota65535/github-openvpn-connect-action/tree/master/.github/workflows/client.ovpn).


### Typical Usage 

```yaml
      - name: Checkout
        uses: actions/checkout@v2
      - name: Install OpenVPN
        run: sudo apt install -y openvpn openvpn-systemd-resolved
      - name: Connect to VPN
        uses: "kota65535/github-openvpn-connect-action@master"
        with:
          config_file: ./github/workflows/client.ovpn
          username: ${{ secrets.USERNAME }}
          password: ${{ secrets.PASSWORD }}
          client_key: ${{ secrets.OVPN_CLIENT_KEY }}
          tls_auth_key: ${{ secrets.OVPN_TLS_AUTH_KEY }}
      - name: Build something
        run: ./gradlew clean build
```
