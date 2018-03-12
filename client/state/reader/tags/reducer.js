/** @format */
/**
 * Internal dependencies
 */
import images from './images/reducer';
import { combineReducers, createReducer } from 'state/utils';
import items from './items/reducer';
import { READER_TAGS } from 'state/action-types';

export const errors = createReducer(
	{},
	{
		[ READER_TAGS ]: ( state, action ) => {
			if ( ! action.error ) {
				return state;
			}
			return { ...state, tag: action.meta.tag };
		},
	}
);

export default combineReducers( {
	images,
	items,
	errors,
} );
