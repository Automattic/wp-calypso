/**
 * External Dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { withStorageKey } from '@automattic/state-utils';
import { TEAMS_REQUEST, TEAMS_RECEIVE } from 'calypso/state/teams/action-types';
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import { itemsSchema } from './schema';

export const items = withSchemaValidation( itemsSchema, ( state = [], action ) => {
	switch ( action.type ) {
		case TEAMS_RECEIVE: {
			if ( action.error ) {
				return state;
			}
			return get( action, [ 'payload', 'teams' ], state );
		}
	}

	return state;
} );

export const isRequesting = ( state = false, action ) => {
	switch ( action.type ) {
		case TEAMS_REQUEST:
			return true;
		case TEAMS_RECEIVE:
			return false;
	}

	return state;
};

const combinedReducer = combineReducers( {
	items,
	isRequesting,
} );

export default withStorageKey( 'teams', combinedReducer );
