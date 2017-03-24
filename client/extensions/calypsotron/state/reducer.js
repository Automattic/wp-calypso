/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import productList from './product-list/reducer';

export default combineReducers( {
	productList,
} );
