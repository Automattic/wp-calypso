/**
 * Module dependencies
 */
import localforage from 'localforage';
import debugFactory from 'debug';

const debug = debugFactory( 'local-sync-handler' );

// default config object
const defaultConfig = {
	driver: localforage.LOCALSTORAGE,
	name: 'calypso',
	version: 1.0,
	//size: 4980736,
	storeName: 'keyvaluepairs',
	description: 'Calypso app storing fata'
}

/**
 * LocalSyncHandler class
 */
export class LocalSyncHandler {
	/**
	 * Create a LocalSyncHandler instance
	 *
	 * @param {Object} [config] - sync config
	 * @param {Function} handler - wpcom handler function
	 *
	 * @return {Function} sync wrapper function
	 */
	constructor( config, handler ) {
		if ( 'function' === typeof config ) {
			handler = config;
			config = {};
		}

		this.config = Object.assign( {}, defaultConfig, config );
		console.log( `-> this.config -> `, this.config );

		return this.wrapper( handler );
	}

	wrapper( handler ) {
		const self = this;

		return function( params, fn ) {
			const path = params.path;

			// response has been sent flag
			let responseSent = false;

			debug( 'starting to get resurce ...' );
			self.getByPath( path, function( err, data ) {
				if ( err ) {
					// @TODO improve error handling here
					console.error( err );
				}

				if ( data ) {
					debug( '%o already storaged. Let\'s be optimistic.', path );
					fn( null, data );
					responseSent = true;
				}

				debug( 'requesting to WP.com' );
				handler( params, ( resErr, resData ) => {
					if ( resErr ) {
						console.log( `-> resErr -> `, resErr );
						return fn( resErr );
					}

					debug( 'WP.com response is here.' );
					self.setByPath( path, resData );

					if ( ! responseSent ) {
						fn( err, resData );
					}
				} );
			} );
		};
	}

	getByPath( path, fn = () => {} ) {
		debug( 'getting data from %o key', path );
		localforage.config( this.config );
		localforage.getItem( path, fn );
	}

	setByPath( path, data, fn = () => {} ) {
		debug( 'storing data in %o key', path );
		// clean some fields
		delete data._headers;

		localforage.config( this.config );
		localforage.setItem( path, data, fn );
	}
}
