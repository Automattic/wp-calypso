Users
=====

A [flux](https://facebook.github.io/flux/docs/overview.html#content) approach for interacting with a site's WordAds data.

#### Settings
The Data that is stored in a site's WordAds settings store looks like this:
```
{
	123456 : { // site.ID
		paypal: 'foo@bar.com',
		who_owns: 'person',
		us_resident 'yes',
		taxid_last4: '1234',
		state: 'CA',
		zip: '12345'
		name: 'Jane Guyman',
		addr1: '1234 Street Ave',
		addr2: 'Apt 3',
		city: 'Anytowne',
		show_to_logged_in: 'yes',
		tos: 'signed',
		optimized_ads: true
	}, etc
}
```

#### Public Methods

**WordadsSettingsStore.getById( site.ID )**
Returns object with settings data and some flags:
```
{
	paypal: 'foo@bar.com',
	who_owns: 'person',
	us_resident 'yes',
	taxid_last4: '1234',
	state: 'CA',
	zip: '12345'
	name: 'Jane Guyman',
	addr1: '1234 Street Ave',
	addr2: 'Apt 3',
	city: 'Anytowne',
	show_to_logged_in: 'yes',
	tos: 'signed',
	optimized_ads: true
	isLoading = true | false,
	isSubmitting = true | false,
	error = { API error object } | null,
	notice = 'Some notice from the Store' | null
}
```

### Actions
Actions get triggered by views and stores.

#### Public methods.

**WordadsActions.fetchSettings( site );**

**WordadsActions.updateSettings( site, settings );**

### Example Component Code

```js
/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import SettingsStore from 'lib/ads/settings-store';

export default class extends React.Component {
	static displayName = 'yourComponent';

	state = this.getSettingsFromStore();

	componentDidMount() {
		SettingsStore.on( 'change', this.updateSettings );
		this._fetchIfEmpty();
	}

	componentWillUnmount() {
		SettingsStore.removeListener( 'change', this.updateSettings );
	}


	getSettingsFromStore: ( siteInstance ) => {
		var site = siteInstance || this.props.site;
		return SettingsStore.getById( site.ID );
	}

	updateSettings: () => {
		this.setState( this.getSettingsFromStore() );
	}

	render() {
		...
	}

	fetchIfEmpty: ( site ) => {
		site = site || this.props.site;
		if ( ! site || ! site.ID ) {
			return;
		}

		if ( SettingsStore.getById( site.ID ).settings ) {
			debug( 'initial fetch not necessary' );
			return;
		}

		// defer fetch requests to avoid dispatcher conflicts
		setTimeout( function() {
			SettingsStore.fetchSettings( site );
		}, 0 );
	}
}
```
