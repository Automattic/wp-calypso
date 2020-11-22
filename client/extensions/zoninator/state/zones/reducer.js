/**
 * Internal dependencies
 */
import { combineReducers, withSchemaValidation, withoutPersistence } from 'calypso/state/utils';
import { itemsSchema } from './schema';
import {
	ZONINATOR_REQUEST_ERROR,
	ZONINATOR_REQUEST_ZONES,
	ZONINATOR_UPDATE_ZONE,
	ZONINATOR_UPDATE_ZONES,
} from '../action-types';

export const requesting = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case ZONINATOR_REQUEST_ZONES: {
			const { siteId } = action;
			return { ...state, [ siteId ]: true };
		}
		case ZONINATOR_UPDATE_ZONES: {
			const { siteId } = action;
			return { ...state, [ siteId ]: false };
		}
		case ZONINATOR_REQUEST_ERROR: {
			const { siteId } = action;
			return { ...state, [ siteId ]: false };
		}
	}

	return state;
} );

export const items = withSchemaValidation( itemsSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case ZONINATOR_UPDATE_ZONES: {
			const { siteId, data } = action;
			return { ...state, [ siteId ]: data };
		}
		case ZONINATOR_UPDATE_ZONE: {
			const { siteId, zoneId, data } = action;

			return {
				...state,
				[ siteId ]: {
					...state[ siteId ],
					[ zoneId ]: data,
				},
			};
		}
	}

	return state;
} );

export default combineReducers( {
	requesting,
	items,
} );
