# Site Stream

A post stream that shows posts from a WordPress.com or Jetpack site.

# Props

- `siteId`: number, The site ID to show posts for
- `store`: The post list store this stream should bind to
- `trackScrollPage`: a callback to call when the user scrolls
- `suppressSiteNameLink`: true if you want to suppress linking the site name on cards to the site page
- `showFollowInHeader`: true if you want to show a follow button in the header,
- `onUpdatesShown`: a callback to call when the user chooses to show new posts,
- `emptyContent`: a component to show when there are no posts to show