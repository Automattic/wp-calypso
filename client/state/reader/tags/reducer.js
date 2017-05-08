/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import images from './images/reducer';
import items from './items/reducer';

export default combineReducers( {
	images,
	items,
} );
