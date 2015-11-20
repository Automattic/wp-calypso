Post Counts Data
================

A React data component that fetches Post Counts data for a given site and passes it into a child component as props.

## Usage

Wrap a child component with `<PostCountsData />`, passing a `siteId` and — optionally — a post status. It'll pass a `count` property to the child with the data.

```jsx
import React from 'react';
import PostCountsData from 'components/data/post-counts-data';

export default React.createClass( {
	render() {
		return (
			<PostCountsData siteId={ site.ID } status="draft">
				<UIComponent />
			</PostCountsData>
		)
	}
} );
```

## Props

- `siteId`: (required) Site id.
- `status`: The post status you want counts for. (i.e. `[ 'publish', 'private', 'draft', 'pending', 'future', 'trash' ]` .)
