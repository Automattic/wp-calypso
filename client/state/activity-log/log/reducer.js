/** @format */
/**
 * External dependencies
 */
import { get, merge } from 'lodash';

/**
 * Internal dependencies
 */
import ActivityQueryManager from 'lib/query-manager/activity';
import { ACTIVITY_LOG_UPDATE, DESERIALIZE, SERIALIZE } from 'state/action-types';
import { isValidStateWithSchema, keyedReducer } from 'state/utils';
import { logItemsSchema } from './schema';

export const logItem = ( state = undefined, { type, data, found, oldestItemTs, query } ) => {
	switch ( type ) {
		case ACTIVITY_LOG_UPDATE:
			return merge(
				( state || new ActivityQueryManager() ).receive( data, { found, oldestItemTs, query } ),
				{ oldestItemTs: 0 < oldestItemTs ? oldestItemTs : get( state, 'oldestItemTs', 0 ) }
			);

		case DESERIALIZE:
			return isValidStateWithSchema( state, logItemsSchema )
				? merge( new ActivityQueryManager( state.data, state.options ), { oldestItemTs } )
				: undefined;

		case SERIALIZE:
			return { data: state.data, options: state.options, oldestItemTs };

		default:
			return state;
	}
};

export const logItems = keyedReducer( 'siteId', logItem, [ DESERIALIZE, SERIALIZE ] );
logItems.hasCustomPersistence = true;
