Like Button
===========

This component is used to display a like button.
It has two parts, the actual button and a container that works with the LikeStore.
For most usage, the container is the easiest route.

#### How to use the container:

```js
var LikeButtonContainer = require( 'components/like-button' );

render: function() {
	return (
		<div className="your-stuff">
			  <LikeButtonContainer siteId={ 66775168 } postId={ 643 } />
		</div>
	);
}
```

#### Props

* `siteId`: number, a site ID to fetch likes for
* `postId`: number, a post ID to fetch likes for


#### How to use the button directly:
```js
var LikeButton = require( 'components/like-button/button' );

render: function() {
	return (
		<div className="your-stuff">
			  <LikeButton likeCount={ 5 } showCount={ true } liked={ false } onLikeToggle={ this.handleLikeToggle } />
		</div>
	);
},

handleLikeToggle: function( newState ) {
	// save the state somehow
}

#### Props

* `likeCount`: the number of likes.
* `showZeroCount`: (default: false) show the number of likes even if it's zero.
* `liked`: (default: false ) a boolean indicating if the current user has liked whatever is being liked.
* `tagName`: (default: 'li' ) string. The container tag to use for the button.
* `onLikeToggle`: a callback that is invoked when the like button toggles. It is called with the new state.
* `isMini`: show a smaller version of the button. Used on comment likes.
