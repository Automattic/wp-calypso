/** @format */
/**
 * Internal dependencies
 */
import images from './images/reducer';
import items from './items/reducer';
import { combineReducers } from 'state/utils';

export default combineReducers( {
	images,
	items,
} );
