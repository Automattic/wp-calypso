Query Top Posts
================

`<QueryTopPosts />` is a React component used to retrieve the top posts (by views) on periods of time.

Reference page from the REST API: https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/stats/top-posts/

## Usage

Render the component, passing a `siteId` and a query parameter (containing at least a `date`). The query object accepts the same parameters than the REST API.

It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryTopPosts from 'components/data/query-top-posts';
import MyTopPostsItem from './top-posts-item';

export default function MyTopPostsItem() {
	return (
		<div>
			<QueryTopPosts siteId={ 3584907 } query={ { date: '2017-06-25' } } />
		</div>
	);
}
```


## Props

### `siteId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The site ID for which the top posts should be requested.

### `query`

<table>
	<tr><th>Type</th><td>Object</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The query object. The `date` is the only required key, and should follow the format `'YYYY-MM-DD'`. The query parameters are sent to the [REST API](https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/stats/top-posts/).
