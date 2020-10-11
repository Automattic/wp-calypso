# Review Replies

This module is used to get admin replies to reviews for a site.

## Actions

### `fetchReviewReplies( siteId: number, reviewId )`

Pulls admin replies to a specific review from the remote site.

## Reducer

This is saved on a per-site basis. All replies are collected in `reviewReplies`, under its corresponding `reviewId`.

```js
const object = {
	reviewReplies: {
		555: [
			/*...*/
		],
	},
};
```

## Selectors

### `getReviewReplies( state, reviewId, [siteId] )`

Gets admin replies for specific review. Returns false if replies could not be found. Optional `siteId`, will default to the currently selected site.

### `getReviewReply( state, reviewId, replyId, [siteId] )`

Gets a specific review reply out of state based on ID. Returns false if the reply could not be found. Optional `siteId`, will default to the currently selected site.
