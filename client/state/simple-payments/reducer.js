/** @format */

/**
 * Internal dependencies
 */

import { combineReducers } from 'client/state/utils';
import productList from './product-list/reducer';

export default combineReducers( {
	productList,
} );
