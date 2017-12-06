/** @format */
/**
 * External dependencies
 */
import stringify from 'json-stable-stringify';

const readCache = () => {
	try {
		return require( '../../../../cached-requests.json' );
	} catch ( e ) {
		return {};
	}
};

const saveRequests = requests => {
	const requestData = {};

	requests.forEach( ( value, key ) => {
		const path = JSON.parse( key ).path;

		if ( ! requestData.hasOwnProperty( path ) ) {
			requestData[ path ] = {};
		}

		requestData[ path ][ key ] = value;
	} );

	const file = new Blob( [ JSON.stringify( requestData, null, 2 ) ], {
		type: 'application/json',
	} );

	const url = URL.createObjectURL( file );
	window.open( url );
};

export const makeOffline = wpcom => {
	const location = window.location;
	const primingRequested = /[&?]wpcom_prime_cache=1/.test( location );
	const offlineRequested = /[&?]wpcom_offline=1/.test( location );

	if ( ! primingRequested && ! offlineRequested ) {
		return wpcom;
	}

	// eslint-disable-next-line no-console
	primingRequested && console.log( 'Priming wpcom request cache' );

	// eslint-disable-next-line no-console
	offlineRequested && console.log( 'Delivering wpcom requests from cache' );

	const request = wpcom.request.bind( wpcom );
	const requests = new Map();

	const storedRequests = readCache();
	Object.keys( storedRequests ).forEach( path => {
		Object.keys( storedRequests[ path ] ).forEach( key => {
			requests.set( key, storedRequests[ path ][ key ] );
		} );
	} );

	window.saveRequests = () => saveRequests( requests );

	Object.defineProperty( wpcom, 'request', {
		value: ( params, callback ) => {
			if ( offlineRequested ) {
				const stored = requests.get( stringify( params ) );

				if ( undefined === callback ) {
					if ( undefined === stored ) {
						return Promise.reject( new Error( 'Network inaccessible' ) );
					}

					return undefined === stored[ 0 ] || null === stored[ 0 ]
						? Promise.reject( stored[ 0 ] )
						: Promise.resolve( ...stored.slice( 1 ) );
				}

				if ( undefined === stored ) {
					callback( new Error( 'Network inaccessible' ) );
				} else {
					callback( ...stored );
				}

				return new XMLHttpRequest();
			}

			if ( ! primingRequested ) {
				return request( params, callback );
			}

			return request( params, ( ...args ) => {
				requests.set( stringify( params ), args );

				return callback( ...args );
			} );
		},
	} );
};
