/**
 * External dependencies
 */
import stringify from 'fast-json-stable-stringify';
import { parse } from 'qs';

const readCache = () => {
	try {
		// load from the project root
		return require( '../../../../cached-requests.json' );
	} catch ( e ) {
		return {};
	}
};

const saveRequests = ( requests ) => {
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

export const makeOffline = ( wpcom ) => {
	// search part includes the leading `?`
	const queryParams = parse( window.location.search.substring( 1 ) );
	const offlineRequested = queryParams.wpcom_offline;
	const primingRequested = queryParams.wpcom_priming;

	if ( ! offlineRequested && ! primingRequested ) {
		return wpcom;
	}

	! offlineRequested &&
		primingRequested &&
		// eslint-disable-next-line no-console
		console.log(
			'Priming wpcom request cache\n' +
				'Run `saveRequests()` in the developer console to save cache file.'
		);

	offlineRequested &&
		// eslint-disable-next-line no-console
		console.log( 'Delivering wpcom requests from cache' );

	const request = wpcom.request.bind( wpcom );
	const requests = new Map();

	const storedRequests = readCache();
	Object.keys( storedRequests ).forEach( ( path ) => {
		Object.keys( storedRequests[ path ] ).forEach( ( key ) => {
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
						// eslint-disable-next-line no-console
						console.error(
							`WPCOM Offline: Request made for uncached request to ${ params.path }\n` +
								'See client/lib/wp/offline-library/README.md for priming instructions.'
						);

						return Promise.reject(
							new Error( 'Network disconnected and request for path not cached.' )
						);
					}

					return undefined === stored[ 0 ] || null === stored[ 0 ]
						? Promise.reject( stored[ 0 ] ) // first arg is error
						: Promise.resolve( ...stored.slice( 1 ) ); // skip error in success handler
				}

				if ( undefined === stored ) {
					// eslint-disable-next-line no-console
					console.error(
						`WPCOM Offline: Request made for uncached request to ${ params.path }\n` +
							'See client/lib/wp/offline-library/README.md for priming instructions.'
					);

					callback( new Error( 'Network disconnected and request for path not cached.' ) );
				} else {
					callback( ...stored );
				}

				// make sure we still return an XHR
				// this is the expected behavior of wpcom.js request
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
