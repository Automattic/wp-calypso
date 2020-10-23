# Follow Button

This component is used to display a follow/unfollow button.
It has two parts, the actual button and a container that works with Redux state.
For most uses, the container is the easiest route.

## How to use the container

```js
import FollowButtonContainer from 'calypso/blocks/follow-button';

function render() {
	return (
		<div className="your-stuff">
			<FollowButtonContainer siteUrl="http://trailnose.com" />
		</div>
	);
}
```

## Props

- `siteUrl`: string, a site URL to follow or unfollow

## How to use the button directly

```js
import FollowButton from 'calypso/blocks/follow-button/button';

function render() {
	return (
		<div className="your-stuff">
			<FollowButton following={ false } />
		</div>
	);
}
```

## Props

- `following`: (default: false) a boolean indicating if the current user is currently following the site URL
- `disabled`: (default: false) a boolean indicating if the button is currently disabled
