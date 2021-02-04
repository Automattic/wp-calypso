/**
 * External dependencies
 */
import { keyedReducer } from '@automattic/state-utils';

/**
 * Internal dependencies
 */
import { combineReducers } from 'calypso/state/utils';
import status from './status/reducer';

const reducers = {
	status,
};

const reducer = combineReducers( reducers );
export default keyedReducer( 'siteId', reducer );
