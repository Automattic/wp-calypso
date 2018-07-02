/** @format */

/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import connectedAccounts from './connected-accounts/reducer';
import productList from './product-list/reducer';

export default combineReducers( {
	connectedAccounts,
	productList,
} );
