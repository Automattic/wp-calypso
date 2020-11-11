/**
 * Internal dependencies
 */

import { combineReducers, withStorageKey } from 'calypso/state/utils';
import productList from './product-list/reducer';

const combinedReducer = combineReducers( {
	productList,
} );

export default withStorageKey( 'simplePayments', combinedReducer );
