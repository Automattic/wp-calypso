/**
 * External dependencies
 */
import { uniqBy } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers, withSchemaValidation, withoutPersistence } from 'calypso/state/utils';
import { items as itemSchemas } from './schema';
import {
	SHARING_BUTTONS_RECEIVE,
	SHARING_BUTTONS_REQUEST,
	SHARING_BUTTONS_REQUEST_FAILURE,
	SHARING_BUTTONS_REQUEST_SUCCESS,
	SHARING_BUTTONS_SAVE,
	SHARING_BUTTONS_SAVE_FAILURE,
	SHARING_BUTTONS_SAVE_SUCCESS,
	SHARING_BUTTONS_UPDATE,
} from 'calypso/state/action-types';

/**
 * Returns the updated requests state after an action has been dispatched. The
 * state maps site ID to whether a request is in progress.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const requesting = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case SHARING_BUTTONS_REQUEST: {
			const { siteId } = action;
			return { ...state, [ siteId ]: true };
		}
		case SHARING_BUTTONS_REQUEST_SUCCESS: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: false,
			};
		}
		case SHARING_BUTTONS_REQUEST_FAILURE: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: false,
			};
		}
	}

	return state;
} );

/**
 * Returns the save Request status after an action has been dispatched. The
 * state maps site ID to the request status
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const saveRequests = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case SHARING_BUTTONS_SAVE: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: { saving: true, status: 'pending' },
			};
		}
		case SHARING_BUTTONS_SAVE_SUCCESS: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: { saving: false, status: 'success' },
			};
		}
		case SHARING_BUTTONS_SAVE_FAILURE: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: { saving: false, status: 'error' },
			};
		}
	}

	return state;
} );

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps site ID to the sharing buttons settings object.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const items = withSchemaValidation( itemSchemas, ( state = {}, action ) => {
	switch ( action.type ) {
		case SHARING_BUTTONS_RECEIVE: {
			const { siteId, settings } = action;

			return {
				...state,
				[ siteId ]: settings,
			};
		}
		case SHARING_BUTTONS_UPDATE: {
			const { siteId, settings } = action;

			return {
				...state,
				[ siteId ]: uniqBy( settings.concat( state[ siteId ] || [] ), 'ID' ),
			};
		}
	}

	return state;
} );

export default combineReducers( {
	items,
	requesting,
	saveRequests,
} );
