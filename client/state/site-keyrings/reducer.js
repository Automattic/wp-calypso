/**
 * Internal dependencies
 */
import { combineReducers, withSchemaValidation, withoutPersistence } from 'state/utils';
import { siteKeyrings as siteKeyringsSchema } from './schema';
import {
	SITE_KEYRINGS_REQUEST,
	SITE_KEYRINGS_REQUEST_FAILURE,
	SITE_KEYRINGS_REQUEST_SUCCESS,
	SITE_KEYRINGS_SAVE,
	SITE_KEYRINGS_SAVE_FAILURE,
	SITE_KEYRINGS_SAVE_SUCCESS,
	SITE_KEYRINGS_DELETE_SUCCESS,
	SITE_KEYRINGS_UPDATE_SUCCESS,
} from 'state/action-types';

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
		case SITE_KEYRINGS_REQUEST: {
			const { siteId } = action;
			return { ...state, [ siteId ]: true };
		}
		case SITE_KEYRINGS_REQUEST_SUCCESS: {
			const { siteId } = action;
			return { ...state, [ siteId ]: false };
		}
		case SITE_KEYRINGS_REQUEST_FAILURE: {
			const { siteId } = action;
			return { ...state, [ siteId ]: false };
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
		case SITE_KEYRINGS_SAVE: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: { saving: true, status: 'pending', error: false },
			};
		}
		case SITE_KEYRINGS_SAVE_SUCCESS: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: { saving: false, status: 'success', error: false },
			};
		}
		case SITE_KEYRINGS_SAVE_FAILURE: {
			const { siteId, error } = action;

			return {
				...state,
				[ siteId ]: { saving: false, status: 'error', error },
			};
		}
	}

	return state;
} );

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps site ID to the site keyrings object.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
const items = withSchemaValidation( siteKeyringsSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case SITE_KEYRINGS_REQUEST_SUCCESS: {
			const { siteId, keyrings } = action;

			return {
				...state,
				[ siteId ]: keyrings,
			};
		}
		case SITE_KEYRINGS_SAVE_SUCCESS: {
			const { siteId, keyring } = action;

			return {
				...state,
				[ siteId ]: ( state[ siteId ] || [] ).concat( [ keyring ] ),
			};
		}
		case SITE_KEYRINGS_UPDATE_SUCCESS: {
			const { siteId, keyringId, externalUserId } = action;

			return {
				...state,
				[ siteId ]: state[ siteId ].map( ( keyring ) =>
					keyring.keyring_id === keyringId
						? { ...keyring, external_user_id: externalUserId }
						: keyring
				),
			};
		}
		case SITE_KEYRINGS_DELETE_SUCCESS: {
			const { siteId, keyringId, externalUserId } = action;

			return {
				...state,
				[ siteId ]: ( state[ siteId ] || [] ).filter(
					( keyring ) =>
						! (
							keyring.keyring_id === keyringId &&
							( ! externalUserId || keyring.external_user_id === externalUserId )
						)
				),
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
