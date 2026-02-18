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
