Post Relative Time
==================

`<PostRelativeTime />` is a React component for rendering the published or modified date of a post in human-readable relative terms.

## Usage

Render the component, passing the global ID of a post:

```js
function MyPost() {
	return <PostRelativeTime globalId="e532356fdb689509a1a5149072e8aafc" />
}
```

`<PostRelativeTime />` does not render a [query component](https://github.com/Automattic/wp-calypso/blob/master/docs/our-approach-to-data.md#query-components), so you should ensure that the post is already loaded into global state. If the post cannot be found, the component will be shown with placeholder styles with the assumption that this indicates the post is being requested. If you do not want the placeholder styles to be used, do not render the component until the global ID is known.

## Props

### `globalId`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

The global ID of the post. If omitted or the associated post cannot be found in global state, the component is shown with placeholder styling.
