/** @format */
/**
 * Internal dependencies
 */
import ActivityQueryManager from 'lib/query-manager/activity';
import { ACTIVITY_LOG_UPDATE, DESERIALIZE, SERIALIZE } from 'state/action-types';
import { isValidStateWithSchema, keyedReducer } from 'state/utils';
import { logItemsSchema } from './schema';

export const logItem = ( state = undefined, { type, data, found, query } ) => {
	switch ( type ) {
		case ACTIVITY_LOG_UPDATE:
			return ( state || new ActivityQueryManager() ).receive( data, { found, query } );

		case DESERIALIZE:
			return isValidStateWithSchema( state, logItemsSchema )
				? new ActivityQueryManager( state.data, state.options )
				: undefined;

		case SERIALIZE:
			return { data: state.data, options: state.options };

		default:
			return state;
	}
};

export const logItems = keyedReducer( 'siteId', logItem, [ DESERIALIZE, SERIALIZE ] );
logItems.hasCustomPersistence = true;
