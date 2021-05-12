# Reader Full Post

The "new" reader full post component

## Props

_required_

- `blogId`: The blog id for the post
- `postId`: The post id
- `onClose`: An onClose event handler function

_optional_

- `referral`: An object containing a `blogId` and `postId`

### Referral

The referral object can be used to link the full post view to its source card in a reader stream. The current usage is to link discover pick cards to the full post view.
