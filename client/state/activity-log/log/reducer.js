/** @format */
/**
 * External dependencies
 */
import { mapValues } from 'lodash';

/**
 * Internal dependencies
 */
import ActivityQueryManager from 'lib/query-manager/activity';
import { ACTIVITY_LOG_UPDATE, DESERIALIZE, SERIALIZE } from 'state/action-types';
import { isValidStateWithSchema, keyedReducer } from 'state/utils';
import { logItemsSchema } from './schema';

const logItem = ( state = undefined, { type, data, found, query } ) => {
	switch ( type ) {
		case ACTIVITY_LOG_UPDATE:
			return ( state || new ActivityQueryManager() ).receive( data, { found, query } );

		case DESERIALIZE:
			return isValidStateWithSchema( state, logItemsSchema )
				? new ActivityQueryManager().receive( state.data, state.options )
				: undefined;

		case SERIALIZE:
			return { data: state.data, options: state.options };
	}

	return state;
};

const logItemsReducer = keyedReducer( 'siteId', logItem );

export const logItems = ( state, action ) =>
	action.type === DESERIALIZE || action.type === SERIALIZE
		? logItemsReducer( mapValues( state, item => logItem( item, action ) ), action )
		: logItemsReducer( state, action );

logItems.hasCustomPersistence = true;
