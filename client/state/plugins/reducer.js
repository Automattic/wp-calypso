/**
 * Internal dependencies
 */
import { withStorageKey } from '@automattic/state-utils';
import { combineReducers } from 'calypso/state/utils';
import wporg from './wporg/reducer';
import premium from './premium/reducer';
import installed from './installed/reducer';
import upload from './upload/reducer';
import recommended from './recommended/reducer';

const combinedReducer = combineReducers( {
	wporg,
	premium,
	installed,
	upload,
	recommended,
} );

export default withStorageKey( 'plugins', combinedReducer );
