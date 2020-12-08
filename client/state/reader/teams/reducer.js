/**
 * External Dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { READER_TEAMS_REQUEST, READER_TEAMS_RECEIVE } from 'calypso/state/reader/action-types';
import { combineReducers, withSchemaValidation, withoutPersistence } from 'calypso/state/utils';
import { itemsSchema } from './schema';

export const items = withSchemaValidation( itemsSchema, ( state = [], action ) => {
	switch ( action.type ) {
		case READER_TEAMS_RECEIVE: {
			if ( action.error ) {
				return state;
			}
			return get( action, [ 'payload', 'teams' ], state );
		}
	}

	return state;
} );

export const isRequesting = withoutPersistence( ( state = false, action ) => {
	switch ( action.type ) {
		case READER_TEAMS_REQUEST:
			return true;
		case READER_TEAMS_RECEIVE:
			return false;
	}

	return state;
} );

export default combineReducers( {
	items,
	isRequesting,
} );
