/** @format */
/**
 * Internal dependencies
 */
import config from 'config';
import { combineReducers } from 'state/utils';
import ui from './ui/reducer';
import sites from './sites/reducer';
import actionList from './action-list/reducer';
import woocommerceServices from 'woocommerce/woocommerce-services/state/reducer';

const wcsEnabled = config.isEnabled( 'woocommerce/extension-wcservices' );

const reducers = {
	ui,
	sites,
	actionList,
};

export default combineReducers(
	wcsEnabled
		? {
				...reducers,
				woocommerceServices,
			}
		: reducers
);
