Typeahead
=========

Typeahead is a React component to enable querying of data, presenting a typeahead selection of resulting items after a query has been entered.

## Usage

Render the component, passing applicable props. If passed, children are rendered as the results of the typeahead query.

```jsx
import React, { Component } from 'react';
import Typeahead from 'components/typeahead';
import MyComponentResult from './result';

export default class MyComponent extends Component {
	constructor( props ) {
		super( props );
		this.state = {
			search: '',
			results: []
		};
	}

	render() {
		const onSearch = ( search ) => {
			this.setState( { search } );
		};

		return (
			<Typeahead
				value={ this.state.search }
				onSearch={ onSearch }>
				{ this.state.results.map( ( result ) => {
					return <MyComponentResult result={ result } />;	
				} ) }
			</Typeahead>
		);
	}
}
```

## Props

### `value`

<table>
	<tr><th>Type</th><td>String</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td><code>null</code></td></tr>
</table>

The search value to be set as the initial input value.

### `onSearch`

<table>
	<tr><th>Type</th><td>Function</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td><code>() => {}</code></td></tr>
</table>

A function handler to be called with the search value after a brief delay, indicating that a search is to be performed.

### `searching`

<table>
	<tr><th>Type</th><td>Boolean</td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td><code>false</code></td></tr>
</table>

A boolean indicating whether a search is in progress.

### `children`

<table>
	<tr><th>Type</th><td><code>React.PropTypes.node</code></td></tr>
	<tr><th>Required</th><td>No</td></tr>
	<tr><th>Default</th><td><code>null</code></td></tr>
</table>

The results to be rendered in the typeahead dropdown.
