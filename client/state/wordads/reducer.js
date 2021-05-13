/**
 * Internal dependencies
 */
import { withStorageKey } from '@automattic/state-utils';
import { combineReducers } from 'calypso/state/utils';
import approve from './approve/reducer';
import earnings from './earnings/reducer';
import settings from './settings/reducer';
import status from './status/reducer';

const combinedReducer = combineReducers( {
	approve,
	earnings,
	settings,
	status,
} );

export default withStorageKey( 'wordads', combinedReducer );
