import { withStorageKey } from '@automattic/state-utils';
import { combineReducers } from 'calypso/state/utils';
import earnings from './earnings/reducer';
import productList from './product-list/reducer';
import settings from './settings/reducer';
import subscribers from './subscribers/reducer';
import subscriptions from './subscriptions/reducer';

export interface IMembershipsState {
	subscriptions: any;
	earnings: any;
	subscribers: any;
	settings: any;
	productList: any;
}

const reducers = {
	subscriptions,
	earnings,
	subscribers,
	settings,
	productList,
};

const combinedReducer = combineReducers( reducers );
export default withStorageKey( 'memberships', combinedReducer );
