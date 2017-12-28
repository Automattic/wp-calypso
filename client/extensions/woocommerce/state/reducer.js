/** @format */

/**
 * Internal dependencies
 */
import { combineReducers } from 'client/state/utils';
import ui from './ui/reducer';
import sites from './sites/reducer';
import actionList from './action-list/reducer';
import woocommerceServices from 'client/extensions/woocommerce/woocommerce-services/state/reducer';

const reducers = {
	ui,
	sites,
	actionList,
	woocommerceServices,
};

export default combineReducers( reducers );
