/**
 * External dependencies
 */
import { includes, isObjectLike, isUndefined, omit } from 'lodash';
import debug from 'debug';
import { EventEmitter } from 'events';

/**
 * Internal Dependencies
 */

import { setCurrentUser } from './utils/current-user';

/**
 * Module variables
 */
const initializeDebug = debug( 'calypso:analytics:initialize' );
const tracksDebug = debug( 'calypso:analytics:tracks' );
const identifyUserDebug = debug( 'calypso:analytics:identifyUser' );

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

// Load tracking scripts
if ( typeof window !== 'undefined' ) {
	window._tkq = window._tkq || [];
}

export const analyticsEvents = new EventEmitter();

export function initializeAnalytics( currentUser, superProps ) {
	// Update super props.
	if ( 'function' === typeof superProps ) {
		initializeDebug( 'superProps', superProps );
		_superProps = superProps;
	}

	// Identify current user.
	if ( 'object' === typeof currentUser ) {
		initializeDebug( 'identifyUser', currentUser );
		analytics.identifyUser( currentUser );
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

export function recordEvent( eventName, eventProperties ) {
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
}
