Users
=====

A [flux](https://facebook.github.io/flux/docs/overview.html#content) approach for interacting with a site's WordAds data.

###The Data
The Data is stored in a private variable but can be accessed though the stores public methods.
####Earnings
The Data that is stored in a site's WordAds earnings store looks like this:
```
{
	123456: { // site.ID
		total_earnings: '3.50'
		total_amount_owed: '2.00'
		wordads: {
			'2015-09': { // period YYYY-MM
				amount: 12.34
				pageviews: '1234'
				status: '1'
			}, etc.

		},
		sponsored: {
			'2015-09': { // period YYYY-MM
				amount: 12.34
				pageviews: '1234'
				status: '1'
			}, etc.

		},
		adjustment: {
			'2015-09': { // period YYYY-MM
				amount: 12.34
				pageviews: '1234'
				status: '1'
			}, etc.

		},
	}, etc.
}
```
####Settings
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
####TOS
The Data that is stored in a site's WordAds TOS store looks like this:
```
{
	// site.ID
	123456 : 'signed', etc.
}
```
####Public Methods

**EarningsStore.getById( site.ID )**
Returns object with earnings data and some flags:
```
{
	earnings: { see above },
	isLoading: true | false,
	error: { API error object } | null
}
```

---

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

---

**WordadsTosStore.getById( site.ID )**
Returns object with tos data and some flags:
```
{
	tos: 'signed',
	isLoading: true | false,
	error: { API error object } | null
	notice: _notice
}
```

###Actions
Actions get triggered by views and stores.

####Public methods.

**WordadsActions.fetchEarnings( site );**

**WordadsActions.fetchSettings( site );**

**WordadsActions.updateSettings( site, settings );**

**WordadsActions.fetchTos( site );**

**WordadsActions.signTos( site );**

###Example Component Code

```
/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var SettingsStore = require( 'lib/ads/settings-store' );

module.exports = React.createClass( {

	displayName: 'yourComponent',

	componentDidMount: function() {
		SettingsStore.on( 'change', this.updateSettings );
		this._fetchIfEmpty();
	},

	componentWillUnmount: function() {
		SettingsStore.removeListener( 'change', this.updateSettings );
	},

	getInitialState: function() {
		return this.getSettingsFromStore();
	},

	getSettingsFromStore: function( siteInstance ) {
		var site = siteInstance || this.props.site;
		return SettingsStore.getById( site.ID );
	},

	updateSettings: function() {
		this.setState( this.getSettingsFromStore() );
	},

	render: function() {
		...
	}

	_fetchIfEmpty: function( site ) {
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
} );
```
