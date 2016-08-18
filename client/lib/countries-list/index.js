/**
 * External dependencies
 */
import debugFactory from 'debug';
import inherits from 'inherits';
import store from 'store';

/**
 * Internal dependencies
 */
import makeEmitter from 'lib/mixins/emitter';
import wp from 'lib/wp';

/**
 * Module variables
 */
const wpcom = wp.undocumented();
const debug = debugFactory( 'calypso:CountriesList' );

/**
 * Initializes a new list of countries.
 *
 * @constructor
 * @param {string} key - key used to identify this list in the store or the debug messages
 */
function CountriesList( key ) {
	if ( ! ( this instanceof CountriesList ) ) {
		return new CountriesList( key );
	}

	this.key = key + 'CountriesList';
	this.initialized = false;
}

/**
 * Adds event capabilities to this list of countries.
 */
makeEmitter( CountriesList.prototype );

/**
 * Fetches the list of countries from the server.
 */
CountriesList.prototype.fetch = function() {
	debug( 'Fetching ' + this.key + ' from api' );

	this.isFetching = true;

	// Sends a request to the API endpoint defined in the subclass
	this.requestFromEndpoint( function( error, countriesList ) {
		if ( error ) {
			debug( 'Unable to fetch ' + this.key + ' from api', error );

			return;
		}

		debug( this.key + ' fetched from api successfully:', countriesList );

		if ( ! this.initialized ) {
			this.initialize( countriesList );
		} else {
			this.data = countriesList;
		}

		this.isFetching = false;

		this.emit( 'change' );

		store.set( this.key, countriesList );
	}.bind( this ) );
};

/**
 * Retrieves the list of countries as a set of key and value pairs. This list will be loaded from the store and then
 * fetched once from the server to update any stale data.
 *
 * @returns {object} the list of countries
 */
CountriesList.prototype.get = function() {
	let data;

	if ( ! this.data ) {
		data = store.get( this.key );

		if ( data ) {
			debug( 'Loaded ' + this.key + ' from store', data );

			this.initialize( data );
		} else {
			this.data = {};
		}

		this.fetch();
	}

	return this.data;
};

/**
 * Determines whether this list of countries has already been loaded from the server or not.
 *
 * @return {boolean} true if this list of countries has been loaded, false otherwise
 */
CountriesList.prototype.hasLoadedFromServer = function() {
	return this.initialized;
};

/**
 * Initializes this list of countries with the specified data.
 *
 * @param {object} data - data
 */
CountriesList.prototype.initialize = function( data ) {
	this.data = data;

	this.initialized = true;
};

/**
 * Initializes a new list of countries for domain registrations.
 *
 * @constructor
 */
function DomainRegistrationCountriesList() {
	CountriesList.call( this, 'DomainRegistration' );
}

inherits( DomainRegistrationCountriesList, CountriesList );

DomainRegistrationCountriesList.prototype.requestFromEndpoint = function( fn ) {
	return wpcom.getDomainRegistrationSupportedCountries( fn );
};

/**
 * Initializes a new list of countries for payments.
 *
 * @constructor
 */
function PaymentCountriesList() {
	CountriesList.call( this, 'Payment' );
}

inherits( PaymentCountriesList, CountriesList );

PaymentCountriesList.prototype.requestFromEndpoint = function( fn ) {
	return wpcom.getPaymentSupportedCountries( fn );
};

/**
 * Initializes a new list of countries for SMS.
 *
 * @constructor
 */
function SmsCountriesList() {
	CountriesList.call( this, 'SMS' );
}

inherits( SmsCountriesList, CountriesList );

SmsCountriesList.prototype.requestFromEndpoint = function( fn ) {
	return wpcom.getSmsSupportedCountries( fn );
};

const domainRegistrationCountriesList = new DomainRegistrationCountriesList();
const paymentCountriesList = new PaymentCountriesList();
const smsCountriesList = new SmsCountriesList();

module.exports = {
	forDomainRegistrations: function() {
		return domainRegistrationCountriesList;
	},
	forPayments: function() {
		return paymentCountriesList;
	},
	forSms: function() {
		return smsCountriesList;
	}
};
