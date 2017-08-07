/** @format */
/**
 * Internal dependencies
 */
import { logItemsSchema } from './schema';
import { ACTIVITY_LOG_UPDATE } from 'state/action-types';
import { createReducer, keyedReducer, withSchemaValidation } from 'state/utils';

// FIXME: No-op reducers
export const logError = keyedReducer( 'siteId', state => state );

const logItemsReducer = keyedReducer(
	'siteId',
	createReducer( [], {
		[ ACTIVITY_LOG_UPDATE ]: ( state, { data } ) => data,
	} )
);

export const logItems = withSchemaValidation( logItemsSchema, logItemsReducer );
