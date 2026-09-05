# Running dev server

There are two ways to run the development server:

## `yarn start`

Runs the entire Calypso, including the multi-site dashboard. These URLs are served:

- `calypso.localhost:3000`
  - The main Calypso app.
  - It corresponds to `wordpress.com` in production.
- `my.localhost:3000`
  - The main dashboard app.
  - It corresponds to `my.wordpress.com` in production.
- `my.woo.localhost:3000`
  - The CIAB variant of the dashboard app.
  - It corresponds to `my.woo.ai` in production.

## `yarn start-dashboard`

Runs only the multi-site dashboard. This command is faster than the above command as it only loads the dashboard code. Only the following URLs are served:

- `my.localhost:3000`
- `my.woo.localhost:3000`
- `my.a4a.localhost:3000`

## Running multiple instances in parallel

To run more than one instance at once (e.g. one per worktree), use the auto-port
variants instead of a hardcoded `PORT`. They pick the first free port starting at
`3000` and print the URL to open:

- `yarn start-auto-port` — same as `yarn start`, on the next free port.
- `yarn start-dashboard-auto-port` — same as `yarn start-dashboard`, on the next free port.

Keep the `*.localhost` hostnames (only the port changes) so authentication via your
logged-in WordPress.com session keeps working. Pass a custom base with
`PORT=3100 yarn start-auto-port` to search upward from `3100`.
