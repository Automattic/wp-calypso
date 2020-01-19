/**
 * Internal dependencies
 */

import { combineReducers } from 'state/utils';
import productList from './product-list/reducer';

export default combineReducers( {
	productList,
} );
