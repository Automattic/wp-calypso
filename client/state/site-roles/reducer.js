/**
 * Internal dependencies
 */
import { siteRolesSchema } from './schema';
import {
	combineReducers,
	withoutPersistence,
	withSchemaValidation,
	withStorageKey,
} from 'calypso/state/utils';
import {
	SITE_ROLES_RECEIVE,
	SITE_ROLES_REQUEST,
	SITE_ROLES_REQUEST_FAILURE,
	SITE_ROLES_REQUEST_SUCCESS,
} from 'calypso/state/action-types';

/**
 * Returns the updated requests state after an action has been dispatched. The
 * state maps site ID keys to a boolean value. Each site is true if roles
 * for it are being currently requested, and false otherwise.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const requesting = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case SITE_ROLES_REQUEST: {
			const { siteId } = action;
			return { ...state, [ siteId ]: true };
		}
		case SITE_ROLES_REQUEST_SUCCESS: {
			const { siteId } = action;
			return { ...state, [ siteId ]: false };
		}
		case SITE_ROLES_REQUEST_FAILURE: {
			const { siteId } = action;
			return { ...state, [ siteId ]: false };
		}
	}

	return state;
} );

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps site ID keys to an object that contains the site roles.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const items = withSchemaValidation( siteRolesSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case SITE_ROLES_RECEIVE: {
			const { siteId, roles } = action;
			return { ...state, [ siteId ]: roles };
		}
	}

	return state;
} );

const combinedReducer = combineReducers( {
	requesting,
	items,
} );

export default withStorageKey( 'siteRoles', combinedReducer );
