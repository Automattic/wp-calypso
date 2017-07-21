/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import ui from './ui/reducer';
import sites from './sites/reducer';
import actionList from './action-list/reducer';
import woocommerceServices from 'woocommerce/woocommerce-services/state/reducer';

const wcsEnabled = config.isEnabled( 'woocommerce/wcs-enabled' );

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
