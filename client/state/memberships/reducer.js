/**
 * Internal dependencies
 */
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
	connectedAccounts,
	productList,
};

export default combineReducers( reducers );
