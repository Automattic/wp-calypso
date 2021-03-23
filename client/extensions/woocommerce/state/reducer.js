/**
 * Internal dependencies
 */
import { withStorageKey } from '@automattic/state-utils';
import { combineReducers } from 'calypso/state/utils';
import sites from './sites/reducer';
import actionList from './action-list/reducer';
import wcApi from './wc-api/reducer';

export default withStorageKey(
	'woocommerce',
	combineReducers( {
		sites,
		actionList,
		wcApi,
	} )
);
