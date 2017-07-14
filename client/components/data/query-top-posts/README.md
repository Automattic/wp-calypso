Query Top Posts
================

`<QueryTopPosts />` is a React component used to retrieve the top posts (by views) on periods of time.

Reference page from the REST API: https://developer.wordpress.com/docs/api/1.1/get/sites/%24site/stats/top-posts/

## Usage

Render the component, passing `siteId`, `date`, `period` (optional) and `num` (optional). It does not accept any children, nor does it render any elements to the page. You can use it adjacent to other sibling components which make use of the fetched data made available through the global application state.

```jsx
import React from 'react';
import QueryTopPosts from 'components/data/query-top-posts';
import MyTopPostsItem from './top-posts-item';

export default function MyTopPostsItem() {
	return (
		<div>
			<QueryTopPosts siteId={ 3584907 } date='2017-06-25' />
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

### `date`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The most recent day to include in the results.

### `period`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td><code>'day'</code></td></tr>
</table>

The period over which the results will be returned: `'day'`, `'week'`, `'month'` or `'year'`.

### `num`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td><code>1</code></td></tr>
</table>

Number of periods to include in the results.
