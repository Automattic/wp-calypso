/** @format */

/**
 * Internal dependencies
 */
import { combineReducers, keyedReducer } from 'state/utils';
import status from './status/reducer';
import endpoints from './endpoints/reducer';

const reducers = {
	status,
	endpoints,
};

const reducer = combineReducers( reducers );
export default keyedReducer( 'siteId', reducer );
