/**
 * Internal dependencies
 */
import { postFormatsItemsSchema } from './schema';
import { combineReducers, withSchemaValidation, withoutPersistence } from 'calypso/state/utils';
import {
	POST_FORMATS_RECEIVE,
	POST_FORMATS_REQUEST,
	POST_FORMATS_REQUEST_SUCCESS,
	POST_FORMATS_REQUEST_FAILURE,
} from 'calypso/state/action-types';

/**
 * Returns the updated requests state after an action has been dispatched. The
 * state maps site ID keys to whether a request for post formats is in progress.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const requesting = withoutPersistence( ( state = {}, action ) => {
	switch ( action.type ) {
		case POST_FORMATS_REQUEST: {
			const { siteId } = action;
			return { ...state, [ siteId ]: true };
		}
		case POST_FORMATS_REQUEST_SUCCESS: {
			const { siteId } = action;
			return { ...state, [ siteId ]: false };
		}
		case POST_FORMATS_REQUEST_FAILURE: {
			const { siteId } = action;
			return { ...state, [ siteId ]: false };
		}
	}

	return state;
} );

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps site ID keys to an object that contains the site supported post formats.
 *
 * @param  {object} state  Current state
 * @param  {object} action Action payload
 * @returns {object}        Updated state
 */
export const items = withSchemaValidation( postFormatsItemsSchema, ( state = {}, action ) => {
	switch ( action.type ) {
		case POST_FORMATS_RECEIVE: {
			const { siteId, formats } = action;
			return { ...state, [ siteId ]: formats };
		}
	}

	return state;
} );

export default combineReducers( {
	requesting,
	items,
} );
