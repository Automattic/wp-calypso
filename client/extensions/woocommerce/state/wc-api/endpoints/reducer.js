/** @format */

/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import products from './products/reducer';

const reducers = {
	products,
};

export default combineReducers( reducers );
