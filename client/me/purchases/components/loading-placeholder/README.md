Loading Placeholder
===================

## Usage

```js
import Card from 'components/card';
import LoadingPlaceholder from 'me/purchases/components/loading-placeholder';
import React from 'react';

const MyComponentLoadingPlaceholder = React.createClass( {
	render() {
		return (
			<LoadingPlaceholder
				className="my-component-loading-placeholder"
				title={ this.translate( 'Header title' ) }>
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
* `path` - **optional** Add a path where back button should lead to.
* `title` - Add a header title.
