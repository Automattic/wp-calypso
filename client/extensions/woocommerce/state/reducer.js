/**
 * Internal dependencies
 */
import actionList from './action-list/reducer';
import sites from './sites/reducer';
import ui from './ui/reducer';
import config from 'config';
import { combineReducers } from 'state/utils';
import woocommerceServices from 'woocommerce/woocommerce-services/state/reducer';

const wcsEnabled = config.isEnabled( 'woocommerce/extension-wcservices' );

const reducers = {
	ui,
	sites,
	actionList,
};

export default combineReducers( wcsEnabled
	? {
		...reducers,
		woocommerceServices,
	}
	: reducers );
