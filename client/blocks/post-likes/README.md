Post Likes
==========

`<PostLikes />` is a connected React component for rendering the post likes.

## Usage

Render the component passing a siteId and a postId.

```jsx
function MyAwesomeComponent() {
	return <PostLikes siteId="10" postId="1143" />;
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
