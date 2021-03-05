/**
 * External dependencies
 */
import debugFactory from 'debug';
import { omit } from 'lodash';

/**
 * Internal dependencies
 */
import { withStorageKey } from '@automattic/state-utils';
import { combineReducers, withSchemaValidation, withPersistence } from 'calypso/state/utils';
import { settingsSchema, systemSchema } from './schema';

import {
	PUSH_NOTIFICATIONS_API_READY,
	PUSH_NOTIFICATIONS_AUTHORIZE,
	PUSH_NOTIFICATIONS_BLOCK,
	PUSH_NOTIFICATIONS_MUST_PROMPT,
	PUSH_NOTIFICATIONS_RECEIVE_REGISTER_DEVICE,
	PUSH_NOTIFICATIONS_RECEIVE_UNREGISTER_DEVICE,
	PUSH_NOTIFICATIONS_TOGGLE_ENABLED,
	PUSH_NOTIFICATIONS_TOGGLE_UNBLOCK_INSTRUCTIONS,
} from 'calypso/state/action-types';

const debug = debugFactory( 'calypso:push-notifications' );

// If you change this, also change the corresponding test
const UNPERSISTED_SYSTEM_NODES = [ 'apiReady', 'authorized', 'authorizationLoaded', 'blocked' ];

const systemReducer = ( state = {}, action ) => {
	switch ( action.type ) {
		case PUSH_NOTIFICATIONS_API_READY: {
			debug( 'API is ready' );
			return Object.assign( {}, state, {
				apiReady: true,
			} );
		}

		case PUSH_NOTIFICATIONS_AUTHORIZE: {
			return Object.assign( {}, state, {
				authorized: true,
				authorizationLoaded: true,
				blocked: false,
			} );
		}

		case PUSH_NOTIFICATIONS_BLOCK: {
			return Object.assign( {}, state, {
				authorized: false,
				authorizationLoaded: true,
				blocked: true,
			} );
		}

		case PUSH_NOTIFICATIONS_MUST_PROMPT: {
			return Object.assign( {}, state, {
				authorized: false,
				authorizationLoaded: true,
				blocked: false,
			} );
		}

		case PUSH_NOTIFICATIONS_RECEIVE_UNREGISTER_DEVICE: {
			const { data } = action;
			if ( ! data.success ) {
				debug( "Couldn't unregister device", data );
			}
			debug( 'Deleted WPCOM subscription', data );
			return omit( state, [ 'wpcomSubscription' ] );
		}

		case PUSH_NOTIFICATIONS_RECEIVE_REGISTER_DEVICE: {
			const { data } = action;

			debug( 'Received WPCOM device registration results', data );

			if ( ! ( data && data.ID ) ) {
				return state;
			}

			return Object.assign( {}, state, {
				wpcomSubscription: {
					ID: data.ID.toString(),
					settings: data.settings,
				},
			} );
		}
	}

	return state;
};

const system = withSchemaValidation(
	systemSchema,
	withPersistence( systemReducer, {
		serialize: ( state ) => omit( state, UNPERSISTED_SYSTEM_NODES ),
		deserialize: ( persisted ) => omit( persisted, UNPERSISTED_SYSTEM_NODES ),
	} )
);

// If you change this, also change the corresponding test
const UNPERSISTED_SETTINGS_NODES = [
	// The dialog should default to hidden
	'showingUnblockInstructions',
];

const settingsReducer = ( state = { enabled: false }, action ) => {
	switch ( action.type ) {
		case PUSH_NOTIFICATIONS_TOGGLE_ENABLED: {
			return Object.assign( {}, state, {
				enabled: ! state.enabled,
			} );
		}

		case PUSH_NOTIFICATIONS_TOGGLE_UNBLOCK_INSTRUCTIONS: {
			return Object.assign( {}, state, {
				showingUnblockInstructions: ! state.showingUnblockInstructions,
			} );
		}

		case PUSH_NOTIFICATIONS_RECEIVE_REGISTER_DEVICE: {
			return Object.assign( {}, state, {
				enabled: true,
			} );
		}
	}

	return state;
};

const settings = withSchemaValidation(
	settingsSchema,
	withPersistence( settingsReducer, {
		serialize: ( state ) => omit( state, UNPERSISTED_SETTINGS_NODES ),
		deserialize: ( persisted ) => omit( persisted, UNPERSISTED_SETTINGS_NODES ),
	} )
);

const combinedReducer = combineReducers( {
	settings,
	system,
} );

export default withStorageKey( 'pushNotifications', combinedReducer );
