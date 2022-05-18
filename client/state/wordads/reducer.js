import { withStorageKey } from '@automattic/state-utils';
import { combineReducers } from 'calypso/state/utils';
import approve from './approve/reducer';
import earnings from './earnings/reducer';
import payments from './payments/reducer';
import settings from './settings/reducer';
import status from './status/reducer';

const combinedReducer = combineReducers( {
	approve,
	earnings,
	settings,
	status,
	payments,
} );

export default withStorageKey( 'wordads', combinedReducer );
