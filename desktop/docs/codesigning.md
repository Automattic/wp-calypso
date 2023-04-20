### Encrypting MacOS and Windows Codesigning Certificates

When it's time to rotate the Windows and MacOS codesigning certificates (".p12" certificates), the encrypted certificates can be generated with the following commands:

`openssl enc -aes-256-cbc -md md5 -in win.p12 -out win.p12.enc -k "{$ENCRYPTION_PASSWORD}"`
