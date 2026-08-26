import { mapValues, omit } from '@automattic/js-utils';
import { PLUGIN_SETUP_INSTRUCTIONS_RECEIVE } from 'calypso/state/action-types';
import { combineReducers, withSchemaValidation, withPersistence } from 'calypso/state/utils';
import { pluginInstructionSchema } from './schema';

/*
 * Tracks the requesting state for premium plugin "instructions" (the list
 * of plugins and API keys) on a per-site index.
 */
export function hasRequested( state = {}, action ) {
	switch ( action.type ) {
		case PLUGIN_SETUP_INSTRUCTIONS_RECEIVE:
			return Object.assign( {}, state, { [ action.siteId ]: true } );
		default:
			return state;
	}
}

/*
 * Tracks all known premium plugin objects (plugin meta and install status),
 * indexed by site ID.
 */
const pluginsReducer = ( state = {}, action ) => {
	switch ( action.type ) {
		case PLUGIN_SETUP_INSTRUCTIONS_RECEIVE:
			return Object.assign( {}, state, { [ action.siteId ]: action.data } );
		default:
			return state;
	}
};

export const plugins = withSchemaValidation(
	pluginInstructionSchema,
	withPersistence( pluginsReducer, {
		// Omit the `key` field, so API keys are never persisted.
		serialize: ( state ) =>
			mapValues( state, ( pluginList ) => pluginList.map( ( item ) => omit( item, 'key' ) ) ),
	} )
);

export default combineReducers( {
	hasRequested,
	plugins,
} );
