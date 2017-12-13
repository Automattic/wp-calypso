/** @format */

/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import ui from './ui/reducer';
import sites from './sites/reducer';
import actionList from './action-list/reducer';
import woocommerceServices from 'woocommerce/woocommerce-services/state/reducer';

const reducers = {
	ui,
	sites,
	actionList,
	woocommerceServices,
};

export default combineReducers( reducers );
