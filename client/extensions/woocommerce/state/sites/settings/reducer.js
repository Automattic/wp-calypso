/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import general from './general/reducer';
import products from './products/reducer';

export default combineReducers( {
	general,
	products,
} );
