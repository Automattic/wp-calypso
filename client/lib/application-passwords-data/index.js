/**
 * External dependencies
 */
import { filter } from 'lodash';
import debugFactory from 'debug';
const debug = debugFactory('calypso:application-passwords-data');
import makeEmitter from 'lib/mixins/emitter';
import store from 'store';

/**
 * Internal dependencies
 */
var wpcom = require( 'lib/wp' ).undocumented();

function ApplicationPasswords() {
	if ( ! ( this instanceof ApplicationPasswords ) ) {
		return new ApplicationPasswords();
	}

	this.data = null;
	this.newApplicationPassword = null;
	this.fetching = false;
}

makeEmitter( ApplicationPasswords.prototype );

ApplicationPasswords.prototype.get = function() {
	if ( ! this.data ) {
		// Fetch data from local storage
		debug( 'First time loading ApplicationPasswords, check store' );
		this.data = store.get( 'wpcom_me_application_passwords' ) || [];

		// Call fetch to refresh data
		this.fetch();
	}

	return this.data;
};

ApplicationPasswords.prototype.fetch = function() {
	this.fetching = true;
	wpcom.me().getApplicationPasswords( function( error, data ) {
		if ( error ) {
			debug( 'Something went wrong fetching application passwords.' );
			return;
		}

		this.data = data.application_passwords;
		this.fetching = false;
		store.set( 'wpcom_me_application_passwords', this.data );

		debug( 'Application passwords successfully retrieved' );
		this.emit( 'change' );
	}.bind( this ) );
};

ApplicationPasswords.prototype.revoke = function( passwordID, callback ) {
	wpcom.me().revokeApplicationPassword( passwordID, function( error, data ) {
		if ( ! error || 'unknown_application_password' === error.error ) {
			// Remove connection from this object and localStorage
			this.data = filter( this.data, function( password ) {
				return parseInt( password.ID, 10 ) !== passwordID;
			} );

			store.set( 'wpcom_me_application_passwords', this.data );
			this.emit( 'change' );
		}

		callback( error, data );
	}.bind( this ) );
};

ApplicationPasswords.prototype.create = function( applicationName, callback ) {
	wpcom.me().createApplicationPassword( applicationName, function( error, data ) {
		if ( error ) {
			debug( 'Creating application password failed.' );
		} else {
			debug( 'Application password successfully created' );

			this.newApplicationPassword = data;
			this.fetch();
		}

		callback( error, data );
	}.bind( this ) );
};

ApplicationPasswords.prototype.hasNewPassword = function() {
	return !! this.newApplicationPassword;
};

ApplicationPasswords.prototype.clearNewPassword = function() {
	this.newApplicationPassword = null;
	this.emit( 'change' );
};

/**
 * Expose ApplicationPasswords
 */
module.exports = new ApplicationPasswords();
