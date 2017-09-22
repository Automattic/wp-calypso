UI Review Replies
=========

This module is used to manage state for the UI for review replies sections. Right now this includes tracking edits or new replies. New replies get placeholder IDs in the format `{ placeholder: 'review_reply_1' }`. The current structure only tracks editing one review per site at a time.

## Actions

### `editReviewReply( siteId: number, reviewId: number, reply: object )`

Track edits made to a review reply, or content added to a new reply.

### `clearReviewReplyEdits( siteId: number )`

Clear the current review reply edit-tracking.

## Reducer

This is saved on a per-site basis.

```js
{
	"reviewReplies": {
		[ siteId ] : {
			edits: {
				currentlyEditingId: 12,
				reviewId: 10
				changes: {
					...data ...
				},
			},
		}
	}
}
```
