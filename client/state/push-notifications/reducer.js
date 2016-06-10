/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import debugFactory from 'debug';
import moment from 'moment';
import omit from 'lodash/omit';
import pick from 'lodash/pick';

/**
 * Internal dependencies
 */
import {
	DESERIALIZE,
	PUSH_NOTIFICATIONS_API_READY,
	PUSH_NOTIFICATIONS_AUTHORIZE,
	PUSH_NOTIFICATIONS_BLOCK,
	PUSH_NOTIFICATIONS_DISMISS_NOTICE,
	PUSH_NOTIFICATIONS_MUST_PROMPT,
	PUSH_NOTIFICATIONS_RECEIVE_SUBSCRIPTION,
	PUSH_NOTIFICATIONS_RECEIVE_REGISTER_DEVICE,
	PUSH_NOTIFICATIONS_RECEIVE_UNREGISTER_DEVICE,
	PUSH_NOTIFICATIONS_TOGGLE_ENABLED,
	PUSH_NOTIFICATIONS_TOGGLE_UNBLOCK_INSTRUCTIONS,
	SERIALIZE,
} from 'state/action-types';
const debug = debugFactory( 'calypso:push-notifications' );

const UNPERSISTED_SYSTEM_NODES = [
	'apiReady',
	'authorized',
	'authorizationLoaded',
	'blocked',
];
function system( state = {}, action ) {
	switch ( action.type ) {
		// System state is not persisted
		case DESERIALIZE: {
			const newState = omit( state, UNPERSISTED_SYSTEM_NODES );
			debug( 'DESERIALIZE system', newState );
			return omit( newState, UNPERSISTED_SYSTEM_NODES );
		}

		case SERIALIZE: {
			const newState = omit( state, UNPERSISTED_SYSTEM_NODES );
			debug( 'SERIALIZE system', newState );
			return newState;
		}

		case PUSH_NOTIFICATIONS_API_READY: {
			debug( 'API is ready' );
			return Object.assign( {}, state, {
				apiReady: true
			} );
		}

		case PUSH_NOTIFICATIONS_AUTHORIZE: {
			return Object.assign( {}, state, {
				authorized: true,
				authorizationLoaded: true,
				blocked: false
			} );
		}

		case PUSH_NOTIFICATIONS_BLOCK: {
			return Object.assign( {}, state, {
				authorized: false,
				authorizationLoaded: true,
				blocked: true
			} );
		}

		case PUSH_NOTIFICATIONS_MUST_PROMPT: {
			return Object.assign( {}, state, {
				authorized: false,
				authorizationLoaded: true,
				blocked: false
			} );
		}

		case PUSH_NOTIFICATIONS_RECEIVE_UNREGISTER_DEVICE: {
			const { data } = action;
			if ( ! data.success ) {
				debug( 'Couldn\'t unregister device', data );
			}
			debug( 'Deleted subscription', data );
			return Object.assign( {}, state, {
				wpcomSubscription: null
			} );
		}

		case PUSH_NOTIFICATIONS_RECEIVE_REGISTER_DEVICE: {
			let lastUpdated;
			const { data } = action;

			debug( 'Received WPCOM device registration results', data );

			if ( data && data._headers && data._headers.Date ) {
				lastUpdated = new Date( data._headers.Date );
				if ( lastUpdated.getTime() ) {
					// Calling moment with non-ISO date strings is deprecated
					// see: https://github.com/moment/moment/issues/1407
					lastUpdated = lastUpdated.toISOString();
				}
			}

			return Object.assign( {}, state, {
				wpcomSubscription: Object.assign( {}, pick( data, [ 'ID', 'settings' ] ), {
					lastUpdated: moment( lastUpdated ).format()
				} )
			} );
		}

		case PUSH_NOTIFICATIONS_RECEIVE_SUBSCRIPTION: {
			const subscription = action.subscription;
			debug( 'receive subscription', subscription );

			return Object.assign( {}, state, {
				subscription,
			} );
		}
	}

	return state;
}

const UNPERSISTED_SETTINGS_NODES = [
	// The dialog should default to hidden
	'showingUnblockInstructions',
];

function settings( state = {}, action ) {
	switch ( action.type ) {
		case DESERIALIZE: {
			const newState = omit( state, UNPERSISTED_SETTINGS_NODES );
			debug( 'DESERIALIZE settings', newState );
			return newState;
		}

		case SERIALIZE: {
			const newState = omit( state, UNPERSISTED_SETTINGS_NODES );
			debug( 'SERIALIZE settings', newState );
			return newState;
		}

		case PUSH_NOTIFICATIONS_TOGGLE_ENABLED: {
			return Object.assign( {}, state, {
				enabled: ! state.enabled
			} );
		}

		case PUSH_NOTIFICATIONS_DISMISS_NOTICE: {
			return Object.assign( {}, state, {
				dismissedNotice: true,
				dismissedNoticeAt: ( new Date() ).getTime(),
			} );
		}

		case PUSH_NOTIFICATIONS_TOGGLE_UNBLOCK_INSTRUCTIONS: {
			return Object.assign( {}, state, {
				showingUnblockInstructions: ! state.showingUnblockInstructions
			} );
		}
	}

	return state;
}

export default combineReducers( {
	settings,
	system
} );
