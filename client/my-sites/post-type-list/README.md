# Post Type List

**Note:** This component is a work-in-progress. As such, the documentation below is incomplete and will change.

`<PostTypeList />` is a React component to be used in rendering an infinitely scrollable list of posts. It is agnostic to any particular post type or query, with flexibility to render any post type, whether it be hierarchical or non-hierarchical, or whether the developer desires to specify custom actions specific to their use-case.

## Usage

Render the component, passing props to describe your query.

```jsx
import React from 'react';
import PostTypeList from 'calypso/my-sites/post-type-list';

export default function MyComponent() {
	return <PostTypeList type="jetpack-portfolio" />;
}
```

## Props

### `type`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The post type for which posts should be queried.

### `showPublishedStatus`

<table>
	<tr><th>Type</th><td>Bool</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td>false</td></tr>
</table>

If true, statuses will be shown for scheduled, trashed, drafted, and published posts.
