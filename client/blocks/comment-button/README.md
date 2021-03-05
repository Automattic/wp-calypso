# Comment Button

This component is used to display a button with an embedded number indicator.

## How to use

```js
import CommentButton from 'calypso/blocks/comment-button';

function render() {
	return <CommentButton commentCount={ 123 } />;
}
```

## Props

- `commentCount`: Number indicating the number of comments to be displayed next to the button.
- `href`: String URL destination to be used with a `tagName` of `a`. Defaults to `null`.
- `onClick`: Function to be executed when the user clicks the button.
- `size`: Number with the size of the comments icon to be displayed. Defaults to 24.
- `target`: String `target` attribute to be used with a `tagName` of `a`. Defaults to `null`.
