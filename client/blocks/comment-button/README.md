Comment Button
=========

This component is used to display a button with an embedded number indicator. It takes `postId` and `siteId` as required properties. It listens to changes to `state.comment.totalCommentsCount`: it displays the total comment count when available on the state, otherwise it displays the comment count passed in as a prop.

#### How to use:

```js
import CommentButton from 'blocks/comment-button';

render() {
	return (
		<CommentButton postId={ 1 } siteId={ 1 } count={ 123 } />
	);
}
```

#### Props

* `count`: Number indicating the number of comments to be displayed next to the button.
* `onClick`: Function to be executed when the user clicks the button.
* `tagName`: String with the HTML tag we are going to use to render the component. Defaults to 'li'.
* `size`: Number with the size of the comments icon to be displayed. Defaults to 24.
* `showLabel`: Boolean indicating whether to display the label text
* `postId`: (required) Number indicating the post ID
* `siteId`: (required) Number indicating the site ID
