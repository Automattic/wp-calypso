/**
 * Internal dependencies
 */
import { combineReducers, withStorageKey } from 'calypso/state/utils';
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

const combinedReducer = combineReducers( reducers );
export default withStorageKey( 'memberships', combinedReducer );
