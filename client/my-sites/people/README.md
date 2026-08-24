# People

The components in this folder handle the `/people` section of Calypso. 'People' refers to users, followers,
viewers, and invites.

`index.js` provides all the routes for this section. `controller.jsx` decides which component to render for each
route.

## Users list

`subscribers-team` renders the unified Users list, covering team members, followers, and email subscribers. The
list shown depends on the chosen filter in `people-section-nav`. Each entry is a `people-list-item` component,
grouped under `people-list-section-header`.

## Invites

`team-invite` renders the invite flow (inviting users by email and generating a shareable invite link).
`people-invites` and `people-invites-pending` list pending invites, and `people-invite-details` shows a single
invite.

## Editing and details

`edit-team-member-form` edits a user's role and profile details. `subscriber-details` and `viewer-details` render
the detail views for subscribers and viewers.

## Data

Data is fetched through the shared query hooks (e.g. site users, external contributors, and invites), which wrap
the WordPress.com REST API.
