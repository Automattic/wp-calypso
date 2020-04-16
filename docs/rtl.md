RTL Testing
===========

To test the Calypso interface in RTL-mode, you need to set your interface language to something which is RTL (e.g. Hebrew) at [Me → Account](https://wordpress.com/me/account).

If you are testing in your local development environment, you will also need to:

- Change `rtl` to `true` in `config/development.json`.
- Restart your local server (`Ctrl-c`, then `yarn start` again).

These additional steps are required because we don't have a user on the server-side in your local environment. On WP.com, we know who the user is, so we can programmatically determine if we should be running in RTL mode.
