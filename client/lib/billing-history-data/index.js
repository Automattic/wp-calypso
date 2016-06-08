/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:my-sites:billing-history:billing-data' ),
	Emitter = require( 'lib/mixins/emitter' ),
	store = require( 'store' ),
	assign = require( 'lodash/assign'),
	i18n = require( 'i18n-calypso' );

/**
 * Internal dependencies
 */
var wpcom = require( 'lib/wp' ).undocumented();

function BillingData() {
	if ( ! ( this instanceof BillingData ) ) {
		return new BillingData();
	}

	this.data = null;
	this.initialized = false;
}

Emitter( BillingData.prototype );

BillingData.prototype.get = function() {
	if ( ! this.data ) {
		debug( 'First time loading BillingData, check store' );
		this.data = store.get( 'BillingData' ) || {};
		this.emit( 'change' );
		this.fetch();
	}
	return this.data;
};

BillingData.prototype.fetch = function() {
	wpcom.me().billingHistory( function( err, response ) {
		if ( err ) {
			throw err;
		}

		this.data.billingHistory = response.billing_history.map( parseDate );
		this.data.upcomingCharges = response.upcoming_charges.map( parseDate );

		if ( ! this.initialized ) {
			this.initialized = true;
			this.emit( 'change' );
		}

		store.set( 'BillingData', this.data );
	}.bind( this ) );
};

function parseDate( transaction ) {
	return assign( {}, transaction, {
		date: i18n.moment( transaction.date ).toDate()
	} );
};

BillingData.prototype.hasLoadedFromServer = function() {
	return this.initialized;
};

BillingData.prototype.getTransaction = function( id ) {
	if ( ! this.data.billingHistory ) {
		return null;
	}

	return this.data.billingHistory.filter( function( transaction ) {
		return id === transaction.id;
	} )[ 0 ];
};

module.exports = new BillingData();
