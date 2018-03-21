/** @format */

/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import ui from './ui/reducer';
import sites from './sites/reducer';
import actionList from './action-list/reducer';
import apiClients from 'woocommerce/rest-api-client/reducer';
import wcApi from './wc-api/reducer';
import woocommerceServices from 'woocommerce/woocommerce-services/state/reducer';

const reducers = {
	ui,
	sites,
	actionList,
	apiClients,
	wcApi,
	woocommerceServices,
};

export default combineReducers( reducers );
