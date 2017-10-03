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
import { createReducer, isValidStateWithSchema } from 'state/utils';

import { logItemsSchema } from './schema';

export const logItems = createReducer(
	{},
	{
		[ ACTIVITY_LOG_UPDATE ]: ( state, { data, found, query, siteId } ) => {
			return state[ siteId ]
				? {
						...state,
						[ siteId ]: state[ siteId ].receive( data, { found, query } ),
					}
				: {
						...state,
						[ siteId ]: new ActivityQueryManager().receive( data, { found, query } ),
					};
		},
		[ DESERIALIZE ]: state => {
			if ( ! isValidStateWithSchema( state, logItemsSchema ) ) {
				return {};
			}
			return mapValues( state, ( { data, options } ) => {
				return new ActivityQueryManager( data, options );
			} );
		},
		[ SERIALIZE ]: state => {
			return mapValues( state, ( { data, options } ) => ( { data, options } ) );
		},
	}
);
