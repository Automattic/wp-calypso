# Following Stream

A stream of posts. Currently serves as the basis for all streams of posts in the reader.

## Props
- `store`: The post list store this stream should bind to
- `trackScrollPage`: a callback to call when the user scrolls
- `suppressSiteNameLink`: true if you want to suppress linking the site name on cards to the site page
- `showFollowInHeader`: true if you want to show a follow button in the header,
- `onUpdatesShown`: a callback to call when the user chooses to show new posts,
- `emptyContent`: a component to show when there are no posts to show


## Moving Forward

We'd like to pull out the base parts into a new PostStream component and have FollowingStream use it.
We would also update the other streams to work against PostStream instead of FollowingStream.
