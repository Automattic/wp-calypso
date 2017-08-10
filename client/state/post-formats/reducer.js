/** @format */
/**
 * Internal dependencies
 */
import { postFormatsItemsSchema } from './schema';
import { combineReducers, createReducer } from 'state/utils';
import {
	POST_FORMATS_RECEIVE,
	POST_FORMATS_REQUEST,
	POST_FORMATS_REQUEST_SUCCESS,
	POST_FORMATS_REQUEST_FAILURE,
} from 'state/action-types';

/**
 * Returns the updated requests state after an action has been dispatched. The
 * state maps site ID keys to whether a request for post formats is in progress.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const requesting = createReducer(
	{},
	{
		[ POST_FORMATS_REQUEST ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: true } ),
		[ POST_FORMATS_REQUEST_SUCCESS ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
		[ POST_FORMATS_REQUEST_FAILURE ]: ( state, { siteId } ) => ( { ...state, [ siteId ]: false } ),
	}
);

/**
 * Returns the updated items state after an action has been dispatched. The
 * state maps site ID keys to an object that contains the site supported post formats.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export const items = createReducer(
	{},
	{
		[ POST_FORMATS_RECEIVE ]: ( state, { siteId, formats } ) => {
			return { ...state, [ siteId ]: formats };
		},
	},
	postFormatsItemsSchema
);

export default combineReducers( {
	requesting,
	items,
} );
