Comment Button
=========

This component is used to display a button with an embedded number indicator.

#### How to use:

```js
import CommentButton from 'blocks/comment-button';

render() {
	return (
		<CommentButton commentCount={ 123 } />
	);
}
```

#### Props

* `commentCount`: Number indicating the number of comments to be displayed next to the button.
* `onClick`: Function to be executed when the user clicks the button.
* `tagName`: String with the HTML tag we are going to use to render the component. Defaults to 'li'.
* `size`: Number with the size of the comments icon to be displayed. Defaults to 24.
