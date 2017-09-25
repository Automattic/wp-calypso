/**
 * External dependencies
 */
import debugFactory from 'debug';
import { filter, find } from 'lodash';

/**
 * Internal dependencies
 */
import Emitter from 'lib/mixins/emitter';

const debug = debugFactory( 'calypso:connected-applications-data' );

/**
 * Internal dependencies
 */
const wpcom = require( 'lib/wp' ).undocumented();

/**
 * Initialize ConnectedApplications with defaults
 */
function ConnectedApplications() {
	if ( ! ( this instanceof ConnectedApplications ) ) {
		return new ConnectedApplications();
	}

	this.data = [];
	this.initialized = false;
	this.fetching = false;
}

Emitter( ConnectedApplications.prototype );

/**
 * Handles the retrieval of connected applications.
 *
 * If ConnectedApplications is being instantitated for the first time, this method
 * will call fetch to initialize `this.data` with the list of connected applications.
 *
 * @return array of connected applications
 */
ConnectedApplications.prototype.get = function() {
	if ( ! this.initialized ) {
		// Call fetch to refresh data
		this.fetch();
	}

	return this.data;
};

/**
 * Fetches connected applications from wpcom API, caches the results in
 * `this.data`, and emits a change event.
 */
ConnectedApplications.prototype.fetch = function() {
	this.fetching = true;
	wpcom.me().getConnectedApplications( function( error, data ) {
		this.fetching = false;

		if ( error ) {
			debug( 'Something went wrong fetching connected applications.' );
			return;
		}

		this.data = data.connected_applications;
		this.initialized = true;

		debug( 'Connected applications successfully retrieved' );
		this.emit( 'change' );
	}.bind( this ) );
};

/**
 * Revokes a connected application's access through the wpcom API, updates
 * `this.data`, then emits a change event.
 *
 * @param  int connectionID The ID of the connection
 */
ConnectedApplications.prototype.revoke = function( connectionID, callback ) {
	wpcom.me().revokeApplicationConnection( connectionID, function( error, data ) {
		if ( error ) {
			debug( 'Revoking application connection failed.' );
			callback( error );
			return;
		}

		this.data = filter( this.data, function( connectedApp ) {
			return parseInt( connectedApp.ID, 10 ) !== connectionID;
		} );

		callback( null, data );
		this.emit( 'change' );
	}.bind( this ) );
};

/**
 * Get details for a single connection, given a connection ID.
 *
 * @param int connectionID The ID of the connection
 */
ConnectedApplications.prototype.getApplication = function( connectionID ) {
	let application;
	if ( ! this.initialized ) {
		this.fetch();
		return;
	}

	application = find( this.data, function( application ) {
		return parseInt( connectionID, 10 ) === parseInt( application.ID, 10 );
	} );

	if ( 'undefined' === typeof application ) {
		this.fetch();
	}

	return application;
};

/**
 * Expose ConnectedApplications
 */
export default new ConnectedApplications();
