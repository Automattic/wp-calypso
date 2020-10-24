/**
 * Internal dependencies
 */

import { combineReducers } from 'calypso/state/utils';
import productList from './product-list/reducer';

export default combineReducers( {
	productList,
} );
