# Debug Tools

Provides a way for the client to send debug back to the wrapper.

## IPC messages

Listens for the following:

- `debug` - sent by the `debug` library running in the client and is then fed to the terminal during development
- `toggle-dev-tools` - toggles Chrome dev tools
