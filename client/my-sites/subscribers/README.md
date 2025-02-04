# Subscribers

The contents of this folder handle the `/subscribers` section of Calypso.

The section displays all the users that subscribed to a certain site, including:

- **Email subscribers** (users that used their email address to subscribe and don't have a WordPress.com account)
- **WordPress.com subscribers** (users that used their WordPress.com account to subscribe)

## Main files

- `index.js` provides all the routes for this section
- `controller.js` decides which component to render
- `main.js` includes the main component with the list of subscribers
- `subscriber-details-page.tsx` displays page with individual subscribers details

## Data

The data are retrieved and mutated using React Query. Please review the `/queries` and `/mutations` folders for details (e.g. which endpoints are used).
