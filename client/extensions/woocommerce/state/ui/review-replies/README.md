# UI Review Replies

This module is used to manage state for the UI for review replies sections. Right now this includes tracking edits or new replies. New replies get placeholder IDs in the format `{ placeholder: 'review_reply_1' }`. The current structure only tracks editing one review per site at a time.

## Actions

### `editReviewReply( siteId: number, reviewId: number, reply: object )`

Track edits made to a review reply, or content added to a new reply.

### `clearReviewReplyEdits( siteId: number )`

Clear the current review reply edit-tracking.

## Reducer

This is saved on a per-site basis.

```js
const object = {
	reviewReplies: {
		[ siteId ]: {
			edits: {
				currentlyEditingId: 12,
				reviewId: 10,
				changes: {
					/*...data ...*/
				},
			},
		},
	},
};
```

## Selectors

### `getCurrentlyEditingReviewReplyId( state, [siteId] )`

Gets the ID of the review reply, or object placeholder (if a new reply). Defaults to null, if no reply is being edited.

### `getCurrentlyEditingReviewId( state, [siteId] )`

Gets The ID of the review that a reply edit is associated with.

### `getReviewReplyEdits( state, [siteId] )`

Gets the local edits made to the reply. Defaults to {} if no reply is being edited.

### `getReviewReplyWithEdits( state, [siteId] )`

Merges the existing reply with the local changes, or just the "changes" if a new reply.

### `isCurrentlyEditingReviewReply( state, [siteId] )`

Whether the given site (or current site) has changes pending.
