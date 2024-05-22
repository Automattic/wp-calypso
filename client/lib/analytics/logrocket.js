import { getCurrentUser } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import debug from 'debug';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { TRACKING_IDS } from './ad-tracking/constants';
import { mayWeTrackByTracker } from './tracker-buckets';

const logRocketDebug = debug( 'calypso:analytics:logrocket' );

let logRocketScriptLoaded = false;

export function mayWeLoadLogRocketScript() {
	return config.isEnabled( 'logrocket' ) && mayWeTrackByTracker( 'logrocket' );
}

export function maybeAddLogRocketScript() {
	if ( logRocketScriptLoaded ) {
		logRocketDebug( 'LogRocket script already loaded' );
		return;
	}

	if ( ! mayWeLoadLogRocketScript() ) {
		logRocketDebug( 'Not loading LogRocket script' );
		return;
	}

	if ( ! isJetpackCloud() ) {
		logRocketDebug( 'Not loading LogRocket script: not Jetpack Cloud' );
		return;
	}

	const script = document.createElement( 'script' );
	script.src = 'https://cdn.logrocket.io/LogRocket.min.js';
	script.crossOrigin = 'anonymous';
	script.async = true;

	script.onload = () => {
		logRocketDebug( 'LogRocket script loaded' );
		if ( window.LogRocket ) {
			window.LogRocket.init( TRACKING_IDS.logRocket, {
				dom: {
					// None of the input elements will be recorded or sent to LogRocket
					// @see https://docs.logrocket.com/reference/dom#sanitize-all-user-input-fields
					inputSanitizer: true,
				},
				// @see https://docs.logrocket.com/v1.0/reference/network
				network: {
					requestSanitizer: ( request ) => {
						// Remove the Authorization header from the request if it exists
						if ( request.headers && request.headers.Authorization ) {
							request.headers.Authorization = null;
						}

						// Remove the body from the request if it exists
						if ( request.body ) {
							delete request.body;
						}

						return request;
					},
					responseSanitizer: ( response ) => {
						// Remove the body from the response if it exists
						if ( response.body ) {
							delete response.body;
						}

						return response;
					},
				},
			} );

			maybeIdentifyUser();
			logRocketScriptLoaded = true;
		}
	};

	script.onerror = () => {
		logRocketDebug( 'Error loading LogRocket script' );
	};

	document.head.appendChild( script );
}

function maybeIdentifyUser() {
	if ( ! window.LogRocket ) {
		return;
	}

	const currentUser = getCurrentUser();

	if ( currentUser ) {
		logRocketDebug( 'maybeIdentifyUser:', currentUser );
		window.LogRocket.identify( currentUser.hashedPii.ID );
	}
}

export function recordLogRocketEvent( name, props ) {
	maybeAddLogRocketScript();

	if ( ! window.LogRocket || ! name ) {
		return;
	}

	logRocketDebug( 'recordLogRocketEvent:', { name, props } );
	window.LogRocket.track( name, props );
}
