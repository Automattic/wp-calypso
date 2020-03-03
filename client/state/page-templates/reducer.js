/**
 * Internal dependencies
 */
import { combineReducers, withSchemaValidation, withoutPersistence } from 'state/utils';
import { itemsSchema } from './schema';
import {
	PAGE_TEMPLATES_RECEIVE,
	PAGE_TEMPLATES_REQUEST,
	PAGE_TEMPLATES_REQUEST_FAILURE,
	PAGE_TEMPLATES_REQUEST_SUCCESS,
} from 'state/action-types';

/**
 * Returns the updated requesting state after an action has been dispatched.
 * Requesting state tracks whether a network request is in progress for a site.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action object
 * @returns {object}        Updated state
 */
export const requesting = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case PAGE_TEMPLATES_REQUEST: {
			const { siteId } = action;
			return { ...state, [ siteId ]: true };
		}
		case PAGE_TEMPLATES_REQUEST_FAILURE: {
			const { siteId } = action;
			return { ...state, [ siteId ]: false };
		}
		case PAGE_TEMPLATES_REQUEST_SUCCESS: {
			const { siteId } = action;
			return { ...state, [ siteId ]: false };
		}
	}

	return state;
} );

/**
 * Returns the updated items state after an action has been dispatched. Items
 * state tracks an array of page templates available for a site. Receiving
 * templates for a site will replace the existing set.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action object
 * @returns {object}        Updated state
 */
export const items = withSchemaValidation( itemsSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case PAGE_TEMPLATES_RECEIVE: {
			const { siteId, templates } = action;
			return { ...state, [ siteId ]: templates };
		}
	}

	return state;
} );

export default combineReducers( {
	requesting,
	items,
} );
