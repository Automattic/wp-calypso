/** @format */
/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import ActivityQueryManager from 'lib/query-manager/activity';
import { ACTIVITY_LOG_UPDATE } from 'state/action-types';
import { createReducer, keyedReducer } from 'state/utils';

// FIXME: Restore persistence after implementing queryManager
//import { logItemsSchema } from './schema';

const debug = debugFactory( 'calypso:state:activity-log:reducer' );

// FIXME: No-op reducers
export const logError = keyedReducer( 'siteId', state => state );

export const logItems = keyedReducer(
	'siteId',
	createReducer( null, {
		[ ACTIVITY_LOG_UPDATE ]: ( state, { data, found, query } ) => {
			debug( 'Action', { data, found, query } );

			return state
				? state.receive( data, { found, query } )
				: new ActivityQueryManager( data, { found, query } );
		},
	} )
);
// logItems.schema = logItemsSchema;
