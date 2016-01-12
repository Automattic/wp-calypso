Posts Typeahead
===============

Posts Typeahead is a React component to enable a visitor to search for posts on a given site, presenting a typeahead selection of resulting posts after a query has been entered.

## Usage

Render the component, passing `siteId`, `search`, and `onSearch` props.

```jsx
import React, { Component } from 'react';
import PostsTypeahead from 'components/posts-typeahead';

export default class MyComponent extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			search: ''
		};
	}

	render() {
		const onSearch = ( search ) => {
			this.setState( { search } );
		};

		return (
			<PostsTypeahead
				siteId={ 3584907 }
				search={ this.state.search }
				onSearch={ onSearch } />
		);
	}
}
```

## Props

### `siteId`

<table>
	<tr><th>Type</th><td>Number</td></tr>
	<tr><th>Required</th><td>Yes</td></tr>
</table>

The site ID for which posts should be queried.

### `search`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td><code>null</code></td></tr>
</table>

The search value used in querying posts. Posts will not be queried if this value is empty.

### `onSearch`

<table>
	<tr><th>Type</th><td>Function</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td><code>null</code></td></tr>
</table>

A function handler to pass to the `<Typeahead />` component, to be called with the search value after a brief delay, indicating that a search is to be performed.
