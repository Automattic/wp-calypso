/**
 * Internal dependencies
 */
import images from './images/reducer';
import { combineReducers } from 'state/utils';
import items from './items/reducer';

export default combineReducers( {
	images,
	items,
} );
