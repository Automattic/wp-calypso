# Post Share

Component/Block to share posts to social-media accounts

## Example

```jsx
import PostShare from 'calypso/blocks/post-share';

<PostShare post={ post } siteId={ siteId } />;
```

## Props

### `post`

A post object.

### `siteId`

The id of the site

### `disabled`

If it's true, the form elements of the component will be disabled such as buttons, input fields, etc.

### `showClose`

If it's true, the component will show a close button at the top right.

### `onClose`

A callback that will be triggered when the close button is clicked.
