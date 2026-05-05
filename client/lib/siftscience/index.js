import config from '@automattic/calypso-config';
import { loadScript } from '@automattic/load-script';
import debugFactory from 'debug';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';

const debug = debugFactory( 'calypso:siftscience' );
const SIFTSCIENCE_URL = 'https://cdn.siftscience.com/s.js';
let hasLoaded = false;

const getSiftQueue = () => {
	if ( typeof window === 'undefined' ) {
		return null;
	}

	if ( ! window._sift ) {
		window._sift = [];
	}

	return window._sift;
};

export function recordSiftScienceUser( context, next ) {
	if ( ! hasLoaded ) {
		const siftQueue = getSiftQueue();
		if ( ! siftQueue ) {
			next();
			return;
		}

		const userId = getCurrentUserId( context.store.getState() );

		siftQueue.push( [ '_setAccount', config( 'siftscience_key' ) ] );
		siftQueue.push( [ '_setUserId', userId ] );
		siftQueue.push( [ '_trackPageview' ] );

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
