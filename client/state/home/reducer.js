/**
 * Internal dependencies
 */
import { HOME_LAYOUT_SET } from 'state/action-types';
import { keyedReducer, combineReducers } from 'state/utils';

export const layout = ( state = {}, action ) =>
	action.type === HOME_LAYOUT_SET ? action.layout : state;

export default keyedReducer(
	'siteId',
	combineReducers( {
		layout,
	} )
);
