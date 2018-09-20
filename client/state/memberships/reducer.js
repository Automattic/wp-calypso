/** @format */

/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import connectedAccounts from './connected-accounts/reducer';
import productList from './product-list/reducer';
import subscriptions from './subscriptions/reducer';

export default combineReducers( {
	connectedAccounts,
	productList,
	subscriptions,
} );
