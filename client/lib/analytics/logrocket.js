import { getCurrentUser } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import debug from 'debug';
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

	const script = document.createElement( 'script' );
	script.src = 'https://cdn.logrocket.io/LogRocket.min.js';
	script.crossOrigin = 'anonymous';
	script.async = true;

	script.onload = () => {
		logRocketDebug( 'LogRocket script loaded' );
		if ( window.LogRocket ) {
			window.LogRocket.init( TRACKING_IDS.logRocket, {
				network: {
					isEnabled: false, // We don't need to record network calls for now
				},
			} );

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
	maybeIdentifyUser();
}
