/** @format */

/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import ui from './ui/reducer';
import sites from './sites/reducer';
import actionList from './action-list/reducer';
import wcApi from './wc-api/reducer';
import woocommerceServices from 'woocommerce/woocommerce-services/state/reducer';

const reducers = {
	ui,
	sites,
	actionList,
	wcApi,
	woocommerceServices,
};

export default combineReducers( reducers );
