/* eslint-disable @typescript-eslint/no-explicit-any */

import { EventEmitter } from 'events';
import { loadScript } from '@automattic/load-script';
import cookie from 'cookie';
import { getPageViewParams } from './page-view-params';
import { getCurrentUser, setCurrentUser } from './utils/current-user';
import debug from './utils/debug';
import getDoNotTrack from './utils/do-not-track';
import getTrackingPrefs from './utils/get-tracking-prefs';

declare global {
	interface Window {
		_tkq: Array< Array< any > >;
	}
}
declare const window: undefined | ( Window & { BUILD_TIMESTAMP?: number } );

/**
 * Tracks uses a bunch of special query params that should not be used as property name
 * See internal Nosara repo?
 */
const TRACKS_SPECIAL_PROPS_NAMES = [ 'geo', 'message', 'request', 'geocity', 'ip' ];
const ALLOWED_EVENT_SOURCES = [ 'calypso', 'jetpack', 'remotedatablocks', 'wpcom_dsp_widget' ];
const EVENT_NAME_EXCEPTIONS = [
	'a8c_cookie_banner_ok',
	'a8c_cookie_banner_view',
	'a8c_ccpa_optout',
	// WooCommerce Onboarding / Connection Flow.
	'wcadmin_storeprofiler_create_jetpack_account',
	'wcadmin_storeprofiler_connect_store',
	'wcadmin_storeprofiler_login_jetpack_account',
	'wcadmin_storeprofiler_payment_login',
	'wcadmin_storeprofiler_payment_create_account',
	// Checkout
	'calypso_checkout_switch_to_p_24',
	'calypso_checkout_composite_p24_submit_clicked',
	// Launch Bar
	'wpcom_launchbar_button_click',
	// Request for free migration
	'wpcom_support_free_migration_request_click',
];

let _superProps: any; // Added to all Tracks events.
let _loadTracksResult = Promise.resolve(); // default value for non-BOM environments.

if ( typeof document !== 'undefined' ) {
	_loadTracksResult = loadScript( '//stats.wp.com/w.js?67' );
}

function createRandomId( randomBytesLength = 9 ): string {
	if ( typeof window === 'undefined' ) {
		return '';
	}
	// 9 * 4/3 = 12
	// this is to avoid getting padding of a random byte string when it is base64 encoded
	let randomBytes: any;

	if ( window.crypto && window.crypto.getRandomValues ) {
		randomBytes = new Uint8Array( randomBytesLength );
		window.crypto.getRandomValues( randomBytes );
	} else {
		randomBytes = Array( randomBytesLength )
			.fill( 0 )
			.map( () => Math.floor( Math.random() * 256 ) );
	}

	return window.btoa( String.fromCharCode( ...randomBytes ) );
}

function getUrlParameter( name: string ): string {
	if ( typeof window === 'undefined' ) {
		return '';
	}
	name = name.replace( /[[]/g, '\\[' ).replace( /[\]]/g, '\\]' );
	const regex = new RegExp( '[\\?&]' + name + '=([^&#]*)' );
	const results = regex.exec( window.location.search );
	return results === null ? '' : decodeURIComponent( results[ 1 ].replace( /\+/g, ' ' ) );
}

function checkForBlockedTracks(): Promise< void > {
	// Proceed only after the tracks script load finished and failed.
	// Calling this function from `initialize` ensures current user is set.
	// This detects stats blocking, and identifies by `getCurrentUser()`, URL, or cookie.
	return _loadTracksResult.catch( () => {
		let _ut;
		let _ui;
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

		debug( 'Loading /nostats.js', { _ut, _ui } );
		return loadScript(
			'/nostats.js?_ut=' + encodeURIComponent( _ut ) + '&_ui=' + encodeURIComponent( _ui )
		);
	} );
}

/**
 * Returns a promise that marks whether and when the external Tracks script loads.
 */
export function getTracksLoadPromise() {
	return _loadTracksResult;
}

export function pushEventToTracksQueue( args: Array< any > ) {
	if ( typeof window !== 'undefined' ) {
		window._tkq = window._tkq || [];
		window._tkq.push( args );
	}
}

export const analyticsEvents: EventEmitter = new EventEmitter();

/**
 * Returns the anoymous id stored in the `tk_ai` cookie
 * @returns The Tracks anonymous user id
 */
export function getTracksAnonymousUserId(): string {
	const cookies = cookie.parse( document.cookie );

	return cookies.tk_ai;
}

export function initializeAnalytics(
	currentUser: any | undefined,
	superProps: any
): Promise< void > {
	// Update super props.
	if ( 'function' === typeof superProps ) {
		debug( 'superProps', superProps );
		_superProps = superProps;
	}

	// Identify current user.
	if ( 'object' === typeof currentUser ) {
		debug( 'identifyUser', currentUser );
		identifyUser( currentUser );
	}

	const tracksLinkerId = getUrlParameter( '_tkl' );
	if ( tracksLinkerId && tracksLinkerId !== getTracksAnonymousUserId() ) {
		// Link tk_ai anonymous ids if _tkl parameter is present in URL and ids between pages are different (e.g. cross-domain)
		signalUserFromAnotherProduct( tracksLinkerId, 'anon' );
	}

	// Tracks blocked?
	debug( 'checkForBlockedTracks' );
	return checkForBlockedTracks();
}

export function identifyUser( userData: any ): any {
	// Ensure object.
	if ( 'object' !== typeof userData ) {
		debug( 'Invalid userData.', userData );
		return; // Not possible.
	}

	// Set current user.
	const currentUser = setCurrentUser( userData );
	if ( ! currentUser ) {
		debug( 'Insufficient userData.', userData );
		return; // Not possible.
	}

	// Tracks user identification.
	debug( 'Tracks identifyUser.', currentUser );
	pushEventToTracksQueue( [ 'identifyUser', currentUser.ID, currentUser.username ] );
}

/**
 * For tracking users between our products, generally passing the id via a request parameter.
 *
 * Use 'anon' for userIdType for anonymous users.
 */
export function signalUserFromAnotherProduct( userId: string, userIdType: string ): any {
	debug( 'Tracks signalUserFromAnotherProduct.', userId, userIdType );
	pushEventToTracksQueue( [ 'signalAliasUserGeneral', userId, userIdType ] );
}

export function recordTracksEvent( eventName: string, eventProperties?: any ) {
	eventProperties = eventProperties || {};

	const currentUser = getCurrentUser();

	if ( currentUser?.localeSlug ) {
		eventProperties[ 'user_lang' ] = currentUser.localeSlug;
	}

	const trackingPrefs = getTrackingPrefs();
	if ( ! trackingPrefs?.buckets.analytics ) {
		debug(
			'Analytics has been disabled - Ignoring event "%s" with actual props %o',
			eventName,
			eventProperties
		);
		return;
	}

	if ( process.env.NODE_ENV !== 'production' && typeof console !== 'undefined' ) {
		if ( ! isValidEventName( eventName ) && ! EVENT_NAME_EXCEPTIONS.includes( eventName ) ) {
			// eslint-disable-next-line no-console
			console.error(
				'Tracks: Event `%s` will be ignored because it does not match with the naming convention and is ' +
					'not a listed exception. Please use a compliant event name.',
				eventName
			);
		}

		for ( const key in eventProperties ) {
			if ( eventProperties[ key ] !== null && typeof eventProperties[ key ] === 'object' ) {
				const errorMessage =
					`Tracks: Unable to record event "${ eventName }" because nested ` +
					`properties are not supported by Tracks. Check '${ key }' on`;
				// eslint-disable-next-line no-console
				console.error( errorMessage, eventProperties );
				return;
			}

			if ( ! /^[a-z_][a-z0-9_]*$/.test( key ) ) {
				// eslint-disable-next-line no-console
				console.error(
					'Tracks: Event `%s` will be rejected because property name `%s` does not match /^[a-z_][a-z0-9_]*$/. ' +
						'Please use a compliant property name.',
					eventName,
					key
				);
			}

			if ( TRACKS_SPECIAL_PROPS_NAMES.indexOf( key ) !== -1 ) {
				// eslint-disable-next-line no-console
				console.error(
					"Tracks: Event property `%s` will be overwritten because it uses one of Tracks' internal prop name: %s. " +
						'Please use another property name.',
					key,
					TRACKS_SPECIAL_PROPS_NAMES.join( ', ' )
				);
			}
		}
	}

	debug( 'Record event "%s" called with props %o', eventName, eventProperties );

	if ( ! isValidEventSource( eventName ) && ! EVENT_NAME_EXCEPTIONS.includes( eventName ) ) {
		debug( '- Event name must be prefixed by a known source or added to `EVENT_NAME_EXCEPTIONS`' );
		return;
	}

	if ( _superProps ) {
		const superProperties = _superProps( eventProperties );
		eventProperties = { ...eventProperties, ...superProperties }; // assign to a new object so we don't modify the argument
	}

	// Remove properties that have an undefined value
	// This allows a caller to easily remove properties from the recorded set by setting them to undefined
	eventProperties = Object.fromEntries(
		Object.entries( eventProperties ).filter( ( [ , val ] ) => typeof val !== 'undefined' )
	);

	debug( 'Recording event "%s" with actual props %o', eventName, eventProperties );

	pushEventToTracksQueue( [ 'recordEvent', eventName, eventProperties ] );
	analyticsEvents.emit( 'record-event', eventName, eventProperties );
}

/**
 * Checks if the event name follows the Tracks naming convention.
 */
function isValidEventName( eventName: string ): boolean {
	return ALLOWED_EVENT_SOURCES.some( ( eventSource: string ): boolean =>
		new RegExp( `^${ eventSource }(?:_[a-z0-9]+){2,}$` ).test( eventName )
	);
}

/**
 * Checks if the event name has a valid source prefix.
 */
function isValidEventSource( eventName: string ): boolean {
	return ALLOWED_EVENT_SOURCES.some( ( eventSource: string ): boolean =>
		eventName.startsWith( `${ eventSource }_` )
	);
}

export function recordTracksPageView( urlPath: string, params: any ) {
	debug( 'Recording pageview in tracks.', urlPath, params );

	let eventProperties = {
		do_not_track: getDoNotTrack() ? 1 : 0,
		path: urlPath,
	};

	// Add calypso build timestamp if set
	const build_timestamp = typeof window !== 'undefined' && window.BUILD_TIMESTAMP;
	if ( build_timestamp ) {
		eventProperties = Object.assign( eventProperties, { build_timestamp } );
	}

	// add optional path params
	if ( params ) {
		eventProperties = Object.assign( eventProperties, params );
	}

	// Record some query parameters as event properties on the page view event
	// so we can analyze their performance with our analytics tools
	if ( typeof window !== 'undefined' && window.location ) {
		const urlParams = new URL( window.location.href ).searchParams;

		// Record all `utm` marketing params.
		const utmParamEntries =
			urlParams &&
			Array.from( urlParams.entries() ).filter( ( [ key ] ) => key.startsWith( 'utm_' ) );
		const utmParams = utmParamEntries ? Object.fromEntries( utmParamEntries ) : {};

		// Record the 'ref' param.
		const refParam = urlParams && urlParams.get( 'ref' ) ? { ref: urlParams.get( 'ref' ) } : {};

		eventProperties = Object.assign( eventProperties, { ...utmParams, ...refParam } );
	}

	recordTracksEvent( 'calypso_page_view', eventProperties );
}

export function recordTracksPageViewWithPageParams( urlPath: string, params?: any ) {
	const pageViewParams = getPageViewParams( urlPath );
	recordTracksPageView( urlPath, Object.assign( params || {}, pageViewParams ) );
}

export function getGenericSuperPropsGetter( config: ( key: string ) => string ) {
	return () => {
		const superProps = {
			environment: process.env.NODE_ENV,
			environment_id: config( 'env_id' ),
			site_id_label: 'wpcom',
			client: config( 'client_slug' ),
		};

		if ( typeof window !== 'undefined' ) {
			Object.assign( superProps, {
				vph: window.innerHeight,
				vpw: window.innerWidth,
			} );
		}

		return superProps;
	};
}
