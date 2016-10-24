Post Item
=========

`<PostItem />` is a connected React component for rendering a post card, including its title, metadata, thumbnail, and actions for managing that post.

## Usage

Render the component, passing a global ID of the post to be rendered. 

```jsx
function MyPostList() {
	return <PostItem globalId="e532356fdb689509a1a5149072e8aafc" />;
}
```

The component does not render a [query component](https://github.com/Automattic/wp-calypso/blob/master/docs/our-approach-to-data.md#query-components), so it's assumed that the post will already have been loaded into global state prior to rendering the component.

## Props

### `globalId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

The global ID of the post to be displayed. If omitted, it's assumed that the post is currently loading, and a post with placeholder styling will be shown instead.
