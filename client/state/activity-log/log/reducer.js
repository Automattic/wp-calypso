/** @format */
/**
 * Internal dependencies
 */
import ActivityQueryManager from 'lib/query-manager/activity';
import { ACTIVITY_LOG_UPDATE } from 'state/action-types';
import { keyedReducer } from 'state/utils';

export const logItem = (
	state = new ActivityQueryManager(),
	{ type, data, found, query, doMerge = false }
) => {
	switch ( type ) {
		case ACTIVITY_LOG_UPDATE:
			return ( doMerge ? state : new ActivityQueryManager() ).receive( data, { found, query } );

		default:
			return state;
	}
};

export const logItems = keyedReducer( 'siteId', logItem );

export const oldestItemTs = keyedReducer( 'siteId', ( state = Infinity, action ) => {
	switch ( action.type ) {
		case ACTIVITY_LOG_UPDATE:
			return null === action.oldestItemTs ? state : Math.min( action.oldestItemTs, state );

		default:
			return state;
	}
} );
