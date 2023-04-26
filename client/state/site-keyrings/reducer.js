import { withStorageKey } from '@automattic/state-utils';
import {
	SITE_KEYRINGS_REQUEST,
	SITE_KEYRINGS_REQUEST_FAILURE,
	SITE_KEYRINGS_REQUEST_SUCCESS,
	SITE_KEYRINGS_SAVE_SUCCESS,
	SITE_KEYRINGS_DELETE_SUCCESS,
	SITE_KEYRINGS_UPDATE_SUCCESS,
} from 'calypso/state/action-types';
import { combineReducers, withSchemaValidation } from 'calypso/state/utils';
import { siteKeyrings as siteKeyringsSchema } from './schema';

/**
 * Returns the updated requests state after an action has been dispatched. The
 * state maps site ID to whether a request is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
 */
export const requesting = ( state = {}, action ) => {
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
};

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps site ID to the site keyrings object.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @returns {Object}        Updated state
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

const combinedReducer = combineReducers( {
	items,
	requesting,
} );

export default withStorageKey( 'siteKeyrings', combinedReducer );
