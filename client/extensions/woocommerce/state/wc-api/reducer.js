/** @format */

/**
 * Internal dependencies
 */
import { combineReducers, keyedReducer } from 'state/utils';
import status from './status/reducer';
import products from './products/reducer';

const reducers = {
	status,
	products,
};

const reducer = combineReducers( reducers );
export default keyedReducer( 'siteId', reducer );
