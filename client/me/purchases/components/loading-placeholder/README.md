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

* `path` - **optional** Add a path where back button should lead to.
* `title` - Add a header title.
