/**
 * Internal dependencies
 */
import { combineReducers, createReducer } from 'state/utils';

import {
	TEST_EXTENSION_FETCH,
	TEST_EXTENSION_FETCH_SUCCESS
} from './action-types';

const testExtension = createReducer( {}, {
	[ TEST_EXTENSION_FETCH ]: ( state, { siteId } ) => ( {
		...state,
		[ siteId ]: {
			fetching: true,
			status: 'pending',
		}
	} ),
	[ TEST_EXTENSION_FETCH_SUCCESS ]: ( state, { siteId, data } ) => ( {
		...state,
		[ siteId ]: {
			fetching: false,
			status: 'loaded',
			data
		}
	} ),

} );

export default combineReducers( {
	testExtension,
} );
