/** @format */

/**
 * Internal dependencies
 */
import { combineReducers, keyedReducer } from 'state/utils';
import status from './status/reducer';

const reducers = {
	status,
};

const reducer = combineReducers( reducers );
export default keyedReducer( 'siteId', reducer );
