/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { combineReducers, withoutPersistence, withStorageKey } from 'calypso/state/utils';
import {
	SITE_ADDRESS_AVAILABILITY_REQUEST,
	SITE_ADDRESS_AVAILABILITY_SUCCESS,
	SITE_ADDRESS_AVAILABILITY_ERROR,
	SITE_ADDRESS_AVAILABILITY_ERROR_CLEAR,
	SITE_ADDRESS_CHANGE_REQUEST,
	SITE_ADDRESS_CHANGE_REQUEST_FAILURE,
	SITE_ADDRESS_CHANGE_REQUEST_SUCCESS,
} from 'calypso/state/action-types';

/**
 * Returns the updated request state after an action has been dispatched. The
 * state maps site ID keys to a boolean value. Each site is true if
 * a site-rename request is currently taking place, and false otherwise.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated rename request state
 */
export const requesting = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case SITE_ADDRESS_CHANGE_REQUEST: {
			const { siteId } = action;
			return { ...state, [ siteId ]: true };
		}
		case SITE_ADDRESS_CHANGE_REQUEST_SUCCESS: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: false,
			};
		}
		case SITE_ADDRESS_CHANGE_REQUEST_FAILURE: {
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
 * Returns the updated site-rename state after an action has been dispatched.
 * Saving state tracks whether the settings for a site are currently being saved.
 *
 * @param  {object} state 	Current rename requesting state
 * @param  {object} action 	Action object
 * @returns {object} 		Updated rename request state
 */
export const status = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case SITE_ADDRESS_CHANGE_REQUEST: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: {
					status: 'pending',
					error: false,
				},
			};
		}
		case SITE_ADDRESS_CHANGE_REQUEST_SUCCESS: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: {
					status: 'success',
					error: false,
				},
			};
		}
		case SITE_ADDRESS_CHANGE_REQUEST_FAILURE: {
			const { siteId, error } = action;

			return {
				...state,
				[ siteId ]: {
					status: 'error',
					error,
				},
			};
		}
	}

	return state;
} );

export const validation = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case SITE_ADDRESS_AVAILABILITY_REQUEST: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: {
					...get( state, siteId, {} ),
					pending: true,
					error: null,
					isAvailable: null,
				},
			};
		}
		case SITE_ADDRESS_AVAILABILITY_SUCCESS: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: {
					...get( state, siteId, {} ),
					pending: false,
					error: null,
					isAvailable: true,
				},
			};
		}
		case SITE_ADDRESS_AVAILABILITY_ERROR: {
			const { siteId, errorType, message } = action;

			return {
				...state,
				[ siteId ]: {
					...get( state, siteId, {} ),
					isAvailable: false,
					pending: false,
					error: {
						errorType,
						message,
					},
				},
			};
		}
		case SITE_ADDRESS_AVAILABILITY_ERROR_CLEAR: {
			const { siteId } = action;

			return {
				...state,
				[ siteId ]: {
					...get( state, siteId, {} ),
					error: null,
					isAvailable: null,
				},
			};
		}
	}

	return state;
} );

const combinedReducer = combineReducers( {
	validation,
	status,
	requesting,
} );

export default withStorageKey( 'siteAddressChange', combinedReducer );
