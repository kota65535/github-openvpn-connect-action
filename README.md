# github-openvpn-connect-action

**NOTE:** Forked from [kota65535/github-openvpn-connect-action](https://github.com/kota65535/github-openvpn-connect-action) to have more control over OVPN params.

GitHub Action for connecting to OpenVPN server.

## Inputs

### General Inputs

| Name          | Description                            | Required              |
| ------------- | -------------------------------------- | --------------------- |
| `config_file` | Location of OpenVPN client config file | yes                   |
| `host`        | Host address of vpn server             | Not provided in .ovpn |
| `port`        | Port (default: 1194)                   | Optional              |
| `protocol`    | Protocol (default: udp4)               | Optional              |

### Authentication Inputs

Supported authentication methods:

- Username & password auth
- Client certificate auth
- Both of them

| Name               | Description                           | Required when           |
| ------------------ | ------------------------------------- | ----------------------- |
| `username`         | Username                              | Username-password auth  |
| `password`         | Password                              | Username-password auth  |
| `ca`               | CA that signed the private key        | Client certificate auth |
| `cert`             | CA's signing certificate              | Client certificate auth |
| `client_key`       | Local peer's private key              | Client certificate auth |
| `client_pass`      | Local peer's private key's passphrase | Client certificate auth |
| `tls_auth_key`     | Pre-shared group key for TLS Auth     | Optional                |
| `tls_crypt_key`    | Pre-shared group key for TLS Crypt    | Optional                |
| `tls_crypt_v2_key` | Per-client key for TLS Crypt V2       | Optional                |

> **Note: It is strongly recommended that you provide all credentials
> via [encrypted secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets).**

When providing TLS keys, you should provide _only one of_ either `tls_auth_key`, `tls_crypt_key` or `tls_crypt_v2_key`.
You can determine which by checking the value of your key and looking in the header line.
[See the docs for more info about TLS in OpenVPN](https://openvpn.net/vpn-server-resources/tls-control-channel-security-in-openvpn-access-server)

## Usage

- Create client configuration file based on
  the [official sample](https://github.com/OpenVPN/openvpn/blob/master/sample/sample-config-files/client.conf) and place at `.github/workflows/client.ovpn`. You may use inline certificates to include them directly in configuration file, and omit them from the action inputs, but one is warned not to hardcode sensitive data in this file. Remove all parts that have a corresponding key in the action inputs (see below).
- Usage in your workflow is like following:

```yaml
- name: Checkout
  uses: actions/checkout@v3
- name: Install OpenVPN
  run: |
    sudo apt update
    sudo apt install -y openvpn openvpn-systemd-resolved
- name: Connect to VPN
  uses: "Morriz/github-openvpn-connect-action@v3"
  with:
    config_file: .github/workflows/client.ovpn
    host: ${{ secrets.OVPN_HOST }}
    username: ${{ secrets.OVPN_USERNAME }}
    password: ${{ secrets.OVPN_PASSWORD }}
    port: ${{ secrets.OVPN_PORT }} # default: 1194
    protocol: ${{ secrets.OVPN_PROTOCOL }} # default: udp4
    ca_cert: ${{ secrets.OVPN_CA_CERT }}
    client_key: ${{ secrets.OVPN_CLIENT_KEY }}
    client_pass: ${{ secrets.OVPN_CLIENT_PASS }}
    tls_auth_key: ${{ secrets.OVPN_TLS_AUTH_KEY }}
- name: Build something
  run: ./gradlew clean build
# The openvpn process is automatically terminated in post-action phase
```

## License

[MIT](LICENSE)
