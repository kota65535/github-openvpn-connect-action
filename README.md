# github-openvpn-connect-action

GitHub Action for connecting to OpenVPN server.

## Inputs

### General Inputs

| Name            | Description                            | Required |
|-----------------|----------------------------------------|----------|
| `config_file`   | Location of OpenVPN client config file | yes      |
| `echo_config`   | Echo OpenVPN config file to the log    | no       |
| `client_version`| OpenVPN client version to use (`v2` or `v3`). Defaults to `v2`. | no |

### Authentication Inputs

Supported authentication methods:

- Username & password auth
- Client certificate auth
- Both of them

| Name               | Description                        | Required when           | 
|--------------------|------------------------------------|-------------------------|
| `username`         | Username                           | Username-password auth  |
| `password`         | Password                           | Username-password auth  |
| `client_key`       | Local peer's private key           | Client certificate auth |
| `tls_auth_key`     | Pre-shared group key for TLS Auth  | Optional                |
| `tls_crypt_key`    | Pre-shared group key for TLS Crypt | Optional                |
| `tls_crypt_v2_key` | Per-client key for TLS Crypt V2    | Optional                |

> **Note: It is strongly recommended that you provide all credentials
via [encrypted secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets).**

When providing TLS keys, you should provide *only one of* either `tls_auth_key`, `tls_crypt_key` or `tls_crypt_v2_key`.
You can determine which by checking the value of your key and looking in the header line. 
[See the docs for more info about TLS in OpenVPN](https://openvpn.net/vpn-server-resources/tls-control-channel-security-in-openvpn-access-server)

## Usage

- Create client configuration file based on
  the [official sample](https://github.com/OpenVPN/openvpn/blob/master/sample/sample-config-files/client.conf). It is
  recommended to use inline certificates to include them directly in configuration file
  like [this](https://github.com/kota65535/github-openvpn-connect-action/tree/master/.github/workflows/client.ovpn).
- Usage in your workflow is like the following:

### Default (OpenVPN v2)

```yaml
      - name: Checkout
        uses: actions/checkout@v5
      - name: Install OpenVPN v2
        run: |
          sudo apt update
          sudo apt install -y openvpn openvpn-systemd-resolved
      - name: Connect to VPN
        uses: "kota65535/github-openvpn-connect-action@v2"
        with:
          config_file: .github/workflows/client.ovpn
          client_version: v2 // if omitted, v2 is assumed
          username: ${{ secrets.OVPN_USERNAME }}
          password: ${{ secrets.OVPN_PASSWORD }}
          client_key: ${{ secrets.OVPN_CLIENT_KEY }}
          tls_auth_key: ${{ secrets.OVPN_TLS_AUTH_KEY }}
      - name: Build something
        run: ./gradlew clean build
```

### OpenVPN v3

```yaml
      - name: Checkout
        uses: actions/checkout@v5
      - name: Install OpenVPN v3
        run: |
          echo "Installing OpenVPN..."
          sudo apt-get update -qq
          sudo apt-get install -qq -y lsb-release curl
          sudo mkdir -p /etc/apt/keyrings && curl -fsSL https://packages.openvpn.net/packages-repo.gpg | sudo tee /etc/apt/keyrings/openvpn.asc
          DISTRO=$(lsb_release -c -s)
          echo "deb [signed-by=/etc/apt/keyrings/openvpn.asc] https://packages.openvpn.net/openvpn3/debian $DISTRO main" | sudo tee /etc/apt/sources.list.d/openvpn-packages.list
          sudo apt-get update
          sudo apt-get install -y openvpn3
          echo "OpenVPN installed successfully"
      - name: Connect to VPN
        uses: "kota65535/github-openvpn-connect-action@v2"
        with:
          config_file: .github/workflows/client.ovpn
          client_version: v3
          username: ${{ secrets.OVPN_USERNAME }}
          password: ${{ secrets.OVPN_PASSWORD }}
          client_key: ${{ secrets.OVPN_CLIENT_KEY }}
          tls_auth_key: ${{ secrets.OVPN_TLS_AUTH_KEY }}
      - name: Build something
        run: ./gradlew clean build
```

### Single-step, both versions (conditional installation example)

```yaml
      - name: Install OpenVPN
        run: |
          if [[ "${{ inputs.client_version }}" == "v3" ]]; then
            echo "Installing OpenVPN v3..."
            sudo apt-get update -qq
            sudo apt-get install -qq -y lsb-release curl
            sudo mkdir -p /etc/apt/keyrings && curl -fsSL https://packages.openvpn.net/packages-repo.gpg | sudo tee /etc/apt/keyrings/openvpn.asc
            DISTRO=$(lsb_release -c -s)
            echo "deb [signed-by=/etc/apt/keyrings/openvpn.asc] https://packages.openvpn.net/openvpn3/debian $DISTRO main" | sudo tee /etc/apt/sources.list.d/openvpn-packages.list
            sudo apt-get update
            sudo apt-get install -y openvpn3
          else
            sudo apt update
            sudo apt install -y openvpn openvpn-systemd-resolved
          fi
```

## License

[MIT](LICENSE)
