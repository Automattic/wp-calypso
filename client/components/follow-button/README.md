Follow Button
=========

This component is used to display a follow/unfollow button.
It has two parts, the actual button and a container that works with the FeedSubscriptionStore.
For most uses, the container is the easiest route.

#### How to use the container:

```js
var FollowButtonContainer = require( 'components/follow-button' );

render: function() {
	return (
		<div className="your-stuff">
			  <FollowButtonContainer siteUrl="http://trailnose.com" />
		</div>
	);
}
```

#### Props

* `siteUrl`: string, a site URL to follow or unfollow

#### How to use the button directly:
```js
var FollowButton = require( 'components/follow-button/button' );

render: function() {
	return (
		<div className="your-stuff">
			  <FollowButton following={ false } />
		</div>
	);
}
```

#### Props

* `following`: (default: false) a boolean indicating if the current user is currently following the site URL
* `disabled`: (default: false) a boolean indicating if the button is currently disabled