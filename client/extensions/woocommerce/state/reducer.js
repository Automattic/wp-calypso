/**
 * Internal dependencies
 */
import { combineReducers, withStorageKey } from 'calypso/state/utils';
import ui from './ui/reducer';
import sites from './sites/reducer';
import actionList from './action-list/reducer';
import wcApi from './wc-api/reducer';
import woocommerceServices from 'woocommerce/woocommerce-services/state/reducer';

export default withStorageKey(
	'woocommerce',
	combineReducers( {
		ui,
		sites,
		actionList,
		wcApi,
		woocommerceServices,
	} )
);
