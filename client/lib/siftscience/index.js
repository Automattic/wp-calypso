import config from '@automattic/calypso-config';
import { loadScript } from '@automattic/load-script';
import debugFactory from 'debug';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';

const debug = debugFactory( 'calypso:siftscience' );
const SIFTSCIENCE_URL = 'https://cdn.siftscience.com/s.js';
let hasLoaded = false;

if ( ! window._sift ) {
	window._sift = [];
}

export function recordSiftScienceUser( context, next ) {
	if ( ! hasLoaded ) {
		const userId = getCurrentUserId( context.store.getState() );

		window._sift.push( [ '_setAccount', config( 'siftscience_key' ) ] );
		window._sift.push( [ '_setUserId', userId ] );
		window._sift.push( [ '_trackPageview' ] );

		hasLoaded = true;
		loadScript( SIFTSCIENCE_URL, function ( error ) {
			if ( error ) {
				debug( 'Error loading siftscience' );
			} else {
				debug( 'siftscience loaded successfully' );
			}
		} );
	}

	next();
}
