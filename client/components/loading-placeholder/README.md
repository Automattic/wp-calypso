Loading Placeholder
===================

## Usage

```js
import Card from 'components/card';
import LoadingPlaceholder from 'components/loading-placeholder';
import React from 'react';

const MyComponentLoadingPlaceholder = React.createClass( {
	render() {
		return (
			<LoadingPlaceholder className="my-component-loading-placeholder">
				<Card>
					{ this.translate( 'Loading…' ) }
				</Card>
			</LoadingPlaceholder
		)
	}
} );

```

## Props

* `className` - **optional** Add a custom class property.
