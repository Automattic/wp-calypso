# Post Likes

`<PostLikes />` is a connected React component for rendering a list of users
who liked a given post. If the user has a primary site set on WP.com, the
user's avatar (and display name, if shown) will link to that site in the
Calypso Reader.

## Usage

Render the component passing a `siteId` and a `postId`.

```jsx
function MyAwesomeComponent() {
	return <PostLikes siteId={ 10 } postId={ 1143 } />;
}
```

## Props

### `siteId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The site ID for which the post likes should be displayed.

### `postId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The post ID for which the post likes should be displayed.

### `showDisplayNames`

<table>
	<tr><th>Type</th><td>Boolean</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

Whether or not to show display names for users who liked the post (and show one
user per line). Defaults to `false`.

## Popover

There is also a version of this component that displays using a `Popover`. The
show/hide logic for this popover must be managed externally: if the popover is
rendered with a valid `context` prop, it will be shown.

```js
import PostLikesPopover from 'calypso/blocks/post-likes/popover';

export default function SomeComponent() {
	return (
		<PostLikesPopover
			context={ context /* Element to render the Popover next to */ }
			onClose={ onClose /* Callback for Esc keypresses, click-outside */ }
			position={ 'bottom' /* optional, and/or any other Popover props */ }
			siteId={ 1234 /* Numeric site ID */ }
			postId={ 1234 /* Numeric post ID */ }
		/>
	);
}
```

See [`docs/example.jsx`](docs/example.jsx) for a full-featured example.
