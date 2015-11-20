# Feed Post Store

A store for holding posts from the FeedBag. These are similar to posts from the
site-based endpoints, but they're keyed differently. FeedBag posts have a feed_ID and a feed_item_ID, in
addition to the site_ID and ID that a standard WP post would have.

## Fetching Posts
This store _does not_ support fetch-on-demand for posts. That is, if you `FeedPostStore.get( 12, 34 )` to get
post 34 from feed 12 and we don't have it, a request is not issued to fetch it. You can ask that the post be fetched
by sending the `fetch` action with the feed ID / post ID you'd like.

## Post States
Instead of using Promises or callbacks to model a pending fetch, we use states on a post object. When a fetch action
is sent, a placeholder post with a `pending` state is created and a `change` event emitted. When the fetch completes,
if the post was successfully fetched, the state is removed. If the fetch errors, the state is changed to `error` and
`message`, `errorCode`, and `statusCode` properties are added to the placeholder object.

## Batching
Since requests for posts tend to come in groups, rather than firing off each request as it comes in, we batch up the
requests and send them together in the next turn of the event loop. Coupled with the `infinite-list` module, this
enables posts to be fetched on demand, even if the post list is quite long.

## Meta Ingest
Some APIs support returning post objects via meta requests. The FeedPostStore listens for relevant `FeedStreamActionType`s
and inspects the meta to see if post objects were available. Objects consumed this way avoid the `pending` state and move
directly to either complete or error.
