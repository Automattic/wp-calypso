/**
 * External dependencies
 */
import { assign, includes, isObjectLike, isUndefined, omit, pickBy, times } from 'lodash';
import { parse } from 'qs';
import cookie from 'cookie';
import url from 'url';
import debug from 'debug';
import { EventEmitter } from 'events';

/**
 * Internal Dependencies
 */

import { getCurrentUser, setCurrentUser } from './utils/current-user';
import { loadScript } from '@automattic/load-script';
import doNotTrack from './utils/do-not-track';

/**
 * Re-export
 */
export { default as doNotTrack } from './utils/do-not-track';
export { getCurrentUser, setCurrentUser } from './utils/current-user';

/**
 * Module variables
 */
const initializeDebug = debug( 'calypso:analytics:initialize' );
const tracksDebug = debug( 'calypso:analytics:tracks' );
const identifyUserDebug = debug( 'calypso:analytics:identifyUser' );
const blockedTracksDebug = debug( 'calypso:analytics:blockedTracks' );

/**
 * Tracks uses a bunch of special query params that should not be used as property name
 * See internal Nosara repo?
 */
const TRACKS_SPECIAL_PROPS_NAMES = [ 'geo', 'message', 'request', 'geocity', 'ip' ];
const EVENT_NAME_EXCEPTIONS = [
	'a8c_cookie_banner_ok',
	// WooCommerce Onboarding / Connection Flow.
	'wcadmin_storeprofiler_create_jetpack_account',
	'wcadmin_storeprofiler_connect_store',
	'wcadmin_storeprofiler_login_jetpack_account',
	'wcadmin_storeprofiler_payment_login',
	'wcadmin_storeprofiler_payment_create_account',
];
let _superProps; // Added to all Tracks events.
let _loadTracksResult = Promise.resolve(); // default value for non-BOM environments.

if ( typeof window !== 'undefined' ) {
	window._tkq = window._tkq || [];
}

if ( typeof document !== 'undefined' ) {
	_loadTracksResult = loadScript( '//stats.wp.com/w.js?60' );
}

function getUrlParameter( name ) {
	name = name.replace( /[[]/g, '\\[' ).replace( /[\]]/g, '\\]' );
	const regex = new RegExp( '[\\?&]' + name + '=([^&#]*)' );
	const results = regex.exec( window.location.search );
	return results === null ? '' : decodeURIComponent( results[ 1 ].replace( /\+/g, ' ' ) );
}

function createRandomId( randomBytesLength = 9 ) {
	// 9 * 4/3 = 12
	// this is to avoid getting padding of a random byte string when it is base64 encoded
	let randomBytes;

	if ( window.crypto && window.crypto.getRandomValues ) {
		randomBytes = new Uint8Array( randomBytesLength );
		window.crypto.getRandomValues( randomBytes );
	} else {
		randomBytes = times( randomBytesLength, () => Math.floor( Math.random() * 256 ) );
	}

	return window.btoa( String.fromCharCode.apply( String, randomBytes ) );
}

function checkForBlockedTracks() {
	// Proceed only after the tracks script load finished and failed.
	// Calling this function from `initialize` ensures current user is set.
	// This detects stats blocking, and identifies by `getCurrentUser()`, URL, or cookie.
	_loadTracksResult.catch( () => {
		let _ut, _ui;
		const currentUser = getCurrentUser();

		if ( currentUser && currentUser.ID ) {
			_ut = 'wpcom:user_id';
			_ui = currentUser.ID;
		} else {
			_ut = getUrlParameter( '_ut' ) || 'anon';
			_ui = getUrlParameter( '_ui' );

			if ( ! _ui ) {
				const cookies = cookie.parse( document.cookie );
				if ( cookies.tk_ai ) {
					_ui = cookies.tk_ai;
				} else {
					const randomIdLength = 18; // 18 * 4/3 = 24 (base64 encoded chars).
					_ui = createRandomId( randomIdLength );
					document.cookie = cookie.serialize( 'tk_ai', _ui );
				}
			}
		}

		blockedTracksDebug( 'Loading /nostats.js', { _ut, _ui } );
		return loadScript(
			'/nostats.js?_ut=' + encodeURIComponent( _ut ) + '&_ui=' + encodeURIComponent( _ui )
		);
	} );
}

export const analyticsEvents = new EventEmitter();

/**
 * Returns the anoymous id stored in the `tk_ai` cookie
 *
 * @returns {string} - The Tracks anonymous user id
 */
export function getTracksAnonymousUserId() {
	const cookies = cookie.parse( document.cookie );

	return cookies.tk_ai;
}

export function initializeAnalytics( currentUser, superProps ) {
	// Update super props.
	if ( 'function' === typeof superProps ) {
		initializeDebug( 'superProps', superProps );
		_superProps = superProps;
	}

	// Identify current user.
	if ( 'object' === typeof currentUser ) {
		initializeDebug( 'identifyUser', currentUser );
		identifyUser( currentUser );
	}

	// Tracks blocked?
	initializeDebug( 'checkForBlockedTracks' );
	checkForBlockedTracks();
}

export function identifyUser( userData ) {
	// Ensure object.
	if ( 'object' !== typeof userData ) {
		identifyUserDebug( 'Invalid userData.', userData );
		return; // Not possible.
	}

	// Set current user.
	const currentUser = setCurrentUser( userData );
	if ( ! currentUser ) {
		identifyUserDebug( 'Insufficient userData.', userData );
		return; // Not possible.
	}

	// Tracks user identification.
	identifyUserDebug( 'Tracks identifyUser.', currentUser );
	window._tkq.push( [ 'identifyUser', currentUser.ID, currentUser.username ] );
}

export function recordTracksEvent( eventName, eventProperties ) {
	eventProperties = eventProperties || {};

	if ( process.env.NODE_ENV !== 'production' && typeof console !== 'undefined' ) {
		if (
			! /^calypso(?:_[a-z]+){2,}$/.test( eventName ) &&
			! includes( EVENT_NAME_EXCEPTIONS, eventName )
		) {
			//eslint-disable-next-line no-console
			console.error(
				'Tracks: Event `%s` will be ignored because it does not match /^calypso(?:_[a-z]+){2,}$/ and is ' +
					'not a listed exception. Please use a compliant event name.',
				eventName
			);
		}

		for ( const key in eventProperties ) {
			if ( isObjectLike( eventProperties[ key ] ) ) {
				const errorMessage =
					`Tracks: Unable to record event "${ eventName }" because nested ` +
					`properties are not supported by Tracks. Check '${ key }' on`;
				console.error( errorMessage, eventProperties ); //eslint-disable-line no-console
				return;
			}

			if ( ! /^[a-z_][a-z0-9_]*$/.test( key ) ) {
				//eslint-disable-next-line no-console
				console.error(
					'Tracks: Event `%s` will be rejected because property name `%s` does not match /^[a-z_][a-z0-9_]*$/. ' +
						'Please use a compliant property name.',
					eventName,
					key
				);
			}

			if ( TRACKS_SPECIAL_PROPS_NAMES.indexOf( key ) !== -1 ) {
				//eslint-disable-next-line no-console
				console.error(
					"Tracks: Event property `%s` will be overwritten because it uses one of Tracks' internal prop name: %s. " +
						'Please use another property name.',
					key,
					TRACKS_SPECIAL_PROPS_NAMES.join( ', ' )
				);
			}
		}
	}

	tracksDebug( 'Record event "%s" called with props %o', eventName, eventProperties );

	if ( ! eventName.startsWith( 'calypso_' ) && ! includes( EVENT_NAME_EXCEPTIONS, eventName ) ) {
		tracksDebug(
			'- Event name must be prefixed by "calypso_" or added to `EVENT_NAME_EXCEPTIONS`'
		);
		return;
	}

	if ( _superProps ) {
		const superProperties = _superProps( eventProperties );
		eventProperties = { ...eventProperties, ...superProperties }; // assign to a new object so we don't modify the argument
	}

	// Remove properties that have an undefined value
	// This allows a caller to easily remove properties from the recorded set by setting them to undefined
	eventProperties = omit( eventProperties, isUndefined );

	tracksDebug( 'Recording event "%s" with actual props %o', eventName, eventProperties );

	if ( 'undefined' !== typeof window ) {
		window._tkq.push( [ 'recordEvent', eventName, eventProperties ] );
	}
	analyticsEvents.emit( 'record-event', eventName, eventProperties );
}

export function recordTracksPageView( urlPath, params ) {
	let eventProperties = {
		build_timestamp: window.BUILD_TIMESTAMP,
		do_not_track: doNotTrack() ? 1 : 0,
		path: urlPath,
	};

	// add optional path params
	if ( params ) {
		eventProperties = assign( eventProperties, params );
	}

	// Record all `utm` marketing parameters as event properties on the page view event
	// so we can analyze their performance with our analytics tools
	if ( window.location ) {
		const parsedUrl = url.parse( window.location.href );
		const urlParams = parse( parsedUrl.query );
		const utmParams = pickBy( urlParams, ( value, key ) => key.startsWith( 'utm_' ) );

		eventProperties = assign( eventProperties, utmParams );
	}

	recordTracksEvent( 'calypso_page_view', eventProperties );
}
