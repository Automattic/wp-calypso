# Post Status

`<PostStatus />` is a React component for rendering relevant status details about a post (sticky, scheduled, pending review, trashed). Renders nothing if there is no relevant status for the post.

## Usage

Render the component, passing the global ID of a post:

```js
function MyPost() {
	return <PostStatus globalId="e532356fdb689509a1a5149072e8aafc" />;
}
```

`<PostStatus />` does not render a [query component](https://github.com/Automattic/wp-calypso/blob/HEAD/docs/our-approach-to-data.md#query-components), so you should ensure that the post is already loaded into global state. If the post cannot be found, nothing will be rendered.

## Props

### `globalId`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

The global ID of the post. If omitted or the associated post cannot be found in global state, the component returns null.

### `showAll`

<table>
	<tr><th>Type</th><td>Bool</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td>false</td></tr>
</table>

If true, statuses will be shown for scheduled, trashed, drafted, and published posts.

### `showIcon`

<table>
	<tr><th>Type</th><td>Bool</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td>true</td></tr>
</table>

If false, an icon will not be displayed along with the status text.
