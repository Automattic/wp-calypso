Comment Likes
=============

This component is used to show a comment like button.

Its label can be:

* "Like", when the comment has 0 likes.
* "Liked", when the user has liked the comment, and that's the only like the comment has.
* "1 Like", when the user has not liked the comment, and the comment has only 1 like.
* "n Likes", when the comment has more than 1 like, regardless of the fact that the user liked it or not.

`CommentLikes` is connected in order to obtain the user like value and the likes count.

#### How to use:

```js
import CommentLikes from 'blocks/comment-likes';

render() {
	return (
		<CommentLikes
			commentId={ 1 }
			postId={ 2 }
			siteId={ 3 }
			toggleLike={ handleToggleLike() }
		/>
	);
}
```

#### Props

* `commentId`: Comment identifier.
* `postId`: Post identifier.
* `siteId`: Site identifier.
* `toggleLike`: Function to be executed when the user clicks the button.
