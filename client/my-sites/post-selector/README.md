# PostSelector

The `PostSelector` component renders a list of Posts with corresponding form actions (radio or checkboxes) and a search box for filtering.

Under the hood, it uses [`<QueryPosts />`](../../components/data/query-posts) to ensure that the requested post data is always made available to the global application posts state.

## Usage

```jsx
import PostSelector from 'calypso/my-sites/post-selector';

<PostSelector siteId={ this.props.siteId } />;
```

## Props

### `siteId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The site ID for which posts should be queried.

### `type`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td><code>"post"</code></td></tr>
</table>

The type of post to query.

### `status`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td><code>"publish,private"</code></td></tr>
</table>

The post status to query.

### `excludeTree`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

A post ID that should be excluded from the post query.

### `orderBy`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td><code>"title"</code></td></tr>
</table>

The post ordering field to be requested in the query.

### `order`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td><code>"ASC"</code></td></tr>
</table>

The post order direction to be requested in the query.

### `multiple`

<table>
	<tr><th>Type</th><td>Boolean</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td><code>false</code></td></tr>
</table>

Whether the results should allow multiple selection (checkbox input) or single selection (radio input).

### `onChange`

<table>
	<tr><th>Type</th><td>Function</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td><code>() => {}</code></td></tr>
</table>

A function to invoke when the selected value has changed. The function will be passed the selected post item as the first argument, and the [change event object](https://developer.mozilla.org/en-US/docs/Web/Events/change) as the second argument.

### `selected`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

The ID of the selected post.

### `emptyMessage`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td><code>""</code></td></tr>
</table>

A message to be shown if no posts are found.

### `createLink`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td><code>""</code></td></tr>
</table>

A link to be shown if the search results in no found posts.

### `showTypeLabels`

<table>
	<tr><th>Type</th><td>Boolean</td></tr>
	<tr><th>Required</th><td>No</td></tr>
</table>

Whether post type labels should be shown adjacent to post options results. If omitted, default behavior is to show the labels only if query `type` is set to `any`.
