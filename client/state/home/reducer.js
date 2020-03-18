/**
 * Internal dependencies
 */
import { HOME_CARDS_SET } from 'state/action-types';
import { keyedReducer, combineReducers } from 'state/utils';

export const cards = ( state = {}, action ) =>
	action.type === HOME_CARDS_SET ? action.cards : state;

export default keyedReducer(
	'siteId',
	combineReducers( {
		cards,
	} )
);
