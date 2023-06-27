import { withStorageKey } from '@automattic/state-utils';
import { JITM_SET, JITM_FETCH } from 'calypso/state/action-types';
import { combineReducers, keyedReducer } from 'calypso/state/utils';

export const storeJITM = ( state = {}, { type, jitms } ) => {
	if ( type === JITM_SET ) {
		return jitms;
	}
	if ( type === JITM_FETCH ) {
		return [];
	}

	return state;
};

export const isFetching = ( _, { type } ) => {
	if ( type === JITM_FETCH ) {
		return true;
	}

	return false;
};

const sitePathJITM = keyedReducer( 'keyedPath', storeJITM );
const isFetchingJITM = keyedReducer( 'keyedPath', isFetching );

const combinedReducer = combineReducers( {
	sitePathJITM,
	isFetchingJITM,
} );

export default withStorageKey( 'jitm', combinedReducer );
