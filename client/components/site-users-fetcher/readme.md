# Site-Users-Fetcher

This is a fetcher component that will retrieve site users from the UsersStore. It takes a single required prop of siteId and fetches all users for that site and feeds them into the child component (as well as passing along any props that were set on the fetcher).

You would generally pair up this component with the `infinite-list` component to manage nextPage requests as a user scrolls through the list because the Users requests come in batches. While `infinite-list` will manage the additional requests, `site-users-fetcher` will simply pass down the updated list as the list changes in the store.

This module will pass in the following props to its child:

- `fetchingUsers` (bool) whether there is an active fetch for the current parameters
- `numUsersFetched` (integer) total number of users fetched with current parameters
- `fetchOptions` (object) current fetch parameters
- `fetchNameSpace` (string) namespace representing unique list
- `totalUsers` (integer) total available users with current parameters
- `users` (array) list of retrieved users
- `usersCurrentOffset` (integer) offset used for latest query

## Props

- `fetchOptions`: (object) The fetch paramers that will be passed into `UserActions.fetchUsers()` to fetch users and `UserActions.getUsers()` to match up with the appropriate user-list. Must contain a `siteId` attribute, but all other query parameters are optional.
- `exclude`: (Array|Function) An array of user IDs that should be excluded or a callback function that returns a boolean.
