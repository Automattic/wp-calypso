Google Apps
===========


GoogleApps is a React component used to add Google Apps email addresses to domains

## Usage

```jsx

import React from 'react';
import GoogleApps from 'components/google-apps';
import productsListFactory from 'lib/products-list';

const productsList = productsListFactory();

React.createClass( {
	render: function() {
		return <GoogleApps
			productsList={ productsList }
			domain={ domain }
			onGoBack={ handleGoBack }
			onAddGoogleApps={ handleAddGoogleApps }
			onClickSkip={ handleClickSkip } />
	}
} );
```

## Props

* `sites` object: An instance of `lib/sites-list`
* (optional) `cart` object: The user's shopping cart
* `domain` object: An object representing a domain name
* `onGoBack` object: Called when the user clicks back in the header cake
* `productsList` object: An instance of `lib/products-list`
* `onAddGoogleApps` funtion: Called when Google Apps is added to the cart
* `onClickSkip` function: Called when the user skips purchasing Google Apps
* (optional) `onSave` function: Called when the user input fields are blurred
* (optional) `initialState` object: Used to prepopulate the component with data
* (optional) `analyticsSection` string: A key used by analytics to track events in the component
* (optional) `initialGoogleAppsCartItem` object: Used to prepopulate the component
