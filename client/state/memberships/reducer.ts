import { withStorageKey } from '@automattic/state-utils';
import { combineReducers } from 'calypso/state/utils';
import couponList from './coupon-list/reducer';
import earnings from './earnings/reducer';
import productList from './product-list/reducer';
import settings from './settings/reducer';
import subscribers from './subscribers/reducer';

export interface IMembershipsState {
	earnings: any;
	subscribers: any;
	settings: any;
	productList: any;
	couponList: any;
}

const reducers = {
	earnings,
	subscribers,
	settings,
	productList,
	couponList,
};

const combinedReducer = combineReducers( reducers );
export default withStorageKey( 'memberships', combinedReducer );
