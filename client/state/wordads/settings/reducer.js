/**
 * Internal dependencies
 */
import { combineReducers, withoutPersistence, withSchemaValidation } from 'calypso/state/utils';
import { items as itemsSchema } from './schema';
import {
	WORDADS_SETTINGS_RECEIVE,
	WORDADS_SETTINGS_SAVE,
	WORDADS_SETTINGS_SAVE_FAILURE,
	WORDADS_SETTINGS_SAVE_SUCCESS,
	WORDADS_SETTINGS_UPDATE,
} from 'calypso/state/action-types';

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps site ID to the WordAds settings object.
 *
 * @param  {object}  state  Current state
 * @param  {object}  action Action payload
 * @returns {object}        Updated state
 */
export const items = withSchemaValidation( itemsSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case WORDADS_SETTINGS_RECEIVE: {
			const { siteId, settings } = action;

			return {
				...state,
				[ siteId ]: settings,
			};
		}
		case WORDADS_SETTINGS_UPDATE: {
			const { siteId, settings } = action;

			return {
				...state,
				[ siteId ]: {
					...state[ siteId ],
					...settings,
				},
			};
		}
	}

	return state;
} );

/**
 * Returns the updated request state after an action has been dispatched. The
 * state maps site ID to a boolean, indicating whether settings are being saved for that site.
 *
 * @param  {object}  state  Current state
 * @param  {object}  action Action payload
 * @returns {object}        Updated state
 */
export const requests = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case WORDADS_SETTINGS_SAVE: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: true,
			};
		}
		case WORDADS_SETTINGS_SAVE_FAILURE:
		case WORDADS_SETTINGS_SAVE_SUCCESS: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: false,
			};
		}
	}

	return state;
} );

export default combineReducers( {
	items,
	requests,
} );
