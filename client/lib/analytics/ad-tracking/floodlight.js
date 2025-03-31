import { getTracksAnonymousUserId, getCurrentUser } from '@automattic/calypso-analytics';
import cookie from 'cookie';
import { mayWeTrackByTracker } from '../tracker-buckets';
import {
	debug,
	DCM_FLOODLIGHT_SESSION_COOKIE_NAME,
	DCM_FLOODLIGHT_SESSION_LENGTH_IN_SECONDS,
} from './constants';

// Ensure setup has run.
import './setup';

/**
 * Records Floodlight events using Gtag and automatically adds `u4`, `u5`, and `allow_custom_scripts: true`.
 * @param {Object} params An object of Floodlight params.
 */
export function recordParamsInFloodlightGtag( params ) {
	if ( ! mayWeTrackByTracker( 'floodlight' ) ) {
		return;
	}

	// Adds u4 (user id) and u5 (anonymous user id) parameters
	const defaults = {
		...floodlightUserParams(),
		// See: https://support.google.com/searchads/answer/7566546?hl=en
		allow_custom_scripts: true,
	};

	const finalParams = [ 'event', 'conversion', { ...defaults, ...params } ];

	debug( 'recordParamsInFloodlightGtag:', finalParams );

	window.gtag( ...finalParams );
}

/**
 * Returns an object with DCM Floodlight user params
 * @returns {Object} With the WordPress.com user id and/or the logged out Tracks id
 */
function floodlightUserParams() {
	const params = {};
	const currentUser = getCurrentUser();
	const anonymousUserId = getTracksAnonymousUserId();

	if ( currentUser ) {
		params.u4 = currentUser.hashedPii.ID;
	}

	if ( anonymousUserId ) {
		params.u5 = anonymousUserId;
	}

	return params;
}

/**
 * Returns the DCM Floodlight session id, generating a new one if there's not already one
 * @returns {string} The session id
 */
function floodlightSessionId() {
	const cookies = cookie.parse( document.cookie );

	const existingSessionId = cookies[ DCM_FLOODLIGHT_SESSION_COOKIE_NAME ];
	if ( existingSessionId ) {
		debug( 'Floodlight: Existing session: ' + existingSessionId );
		return existingSessionId;
	}

	// Generate a 32-byte random session id
	const newSessionId = crypto.randomUUID().replace( new RegExp( '-', 'g' ), '' );
	debug( 'Floodlight: New session: ' + newSessionId );
	return newSessionId;
}

/**
 * Track a page view in DCM Floodlight
 * @param {string} urlPath - The URL path
 * @returns {void}
 */
export function recordPageViewInFloodlight( urlPath ) {
	if ( ! mayWeTrackByTracker( 'floodlight' ) ) {
		return;
	}

	const sessionId = floodlightSessionId();

	// Set or bump the cookie's expiration date to maintain the session
	document.cookie = cookie.serialize( DCM_FLOODLIGHT_SESSION_COOKIE_NAME, sessionId, {
		maxAge: DCM_FLOODLIGHT_SESSION_LENGTH_IN_SECONDS,
	} );

	debug( 'retarget: recordPageViewInFloodlight: wpvisit' );
	recordParamsInFloodlightGtag( {
		session_id: sessionId,
		u6: urlPath,
		u7: sessionId,
		send_to: 'DC-6355556/wordp0/wpvisit+per_session',
	} );

	debug( 'retarget: recordPageViewInFloodlight: wppv' );
	recordParamsInFloodlightGtag( {
		u6: urlPath,
		u7: sessionId,
		send_to: 'DC-6355556/wordp0/wppv+standard',
	} );
}
