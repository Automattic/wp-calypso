# Reader Full Post

The full post view in the Reader. This is based on the Dialog component.

## Props

Takes either a `blogId` and `postId` or a `feedId` and `postId`. The kind of `postId` varies depending on what was passed.

- `feedId`: The ID of the feed that holds the post
- `blogId`: The ID of the blog that holds the post
- `postId`: The ID of the post
- `isVisible`: bool, whether or not the dialog is visible
- `onClose`: function, called when the Dialog is closed
