/** @format */

/**
 * Internal dependencies
 */
import config from 'config';
import { combineReducers } from 'state/utils';
import connectedAccounts from './connected-accounts/reducer';
import productList from './product-list/reducer';
import subscriptions from './subscriptions/reducer';
import earnings from './earnings/reducer';
import subscribers from './subscribers/reducer';
import settings from './settings/reducer';

const reducers = {
	subscriptions,
	earnings,
	subscribers,
	settings,
};

if ( config.isEnabled( 'memberships' ) ) {
	reducers.connectedAccounts = connectedAccounts;
	reducers.productList = productList;
}

export default combineReducers( reducers );
