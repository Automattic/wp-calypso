/**
 * External Dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import {
	READER_ORGANIZATIONS_REQUEST,
	READER_ORGANIZATIONS_RECEIVE,
} from 'calypso/state/reader/action-types';
import { combineReducers, withSchemaValidation, withoutPersistence } from 'calypso/state/utils';
import { itemsSchema } from './schema';

export const items = withSchemaValidation( itemsSchema, ( state = [], action ) => {
	switch ( action.type ) {
		case READER_ORGANIZATIONS_RECEIVE: {
			if ( action.error ) {
				return state;
			}
			return get( action, [ 'payload', 'organizations' ], state );
		}
	}

	return state;
} );

export const isRequesting = withoutPersistence( ( state = false, action ) => {
	switch ( action.type ) {
		case READER_ORGANIZATIONS_REQUEST:
			return true;
		case READER_ORGANIZATIONS_RECEIVE:
			return false;
	}

	return state;
} );

export default combineReducers( {
	items,
	isRequesting,
} );
