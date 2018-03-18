/** @format */

/**
 * Internal dependencies
 */
import ActivityQueryManager from 'lib/query-manager/activity';
import { ACTIVITY_LOG_UPDATE, DESERIALIZE, SERIALIZE } from 'state/action-types';
import { withSchemaValidation, keyedReducer } from 'state/utils';
import { logItemsSchema } from './schema';

export const logItem = withSchemaValidation(
	logItemsSchema,
	( state = new ActivityQueryManager(), { type, data, found, query } ) => {
		switch ( type ) {
			case ACTIVITY_LOG_UPDATE:
				return state.receive( data, { found, query } );

			case DESERIALIZE:
				return new ActivityQueryManager( state.data, state.options );

			case SERIALIZE:
				return { data: state.data, options: state.options };

			default:
				return state;
		}
	}
);

export const logItems = keyedReducer( 'siteId', logItem );
logItems.hasCustomPersistence = true;

export const oldestItemTs = keyedReducer( 'siteId', ( state = Infinity, action ) => {
	switch ( action.type ) {
		case ACTIVITY_LOG_UPDATE:
			return null === action.oldestItemTs ? state : Math.min( action.oldestItemTs, state );

		default:
			return state;
	}
} );
