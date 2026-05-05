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

let reducer;

const getReducer = () => {
	if ( reducer ) {
		return reducer;
	}

	const sitePathJITM = keyedReducer( 'keyedPath', storeJITM );
	const isFetchingJITM = keyedReducer( 'keyedPath', isFetching );

	const combinedReducer = combineReducers( {
		sitePathJITM,
		isFetchingJITM,
	} );

	reducer = withStorageKey( 'jitm', combinedReducer );
	return reducer;
};

const jitmReducer = ( state, action ) => getReducer()( state, action );

jitmReducer.storageKey = 'jitm';
jitmReducer.serialize = ( state ) => getReducer().serialize?.( state );
jitmReducer.deserialize = ( persisted ) => getReducer().deserialize?.( persisted );

export default jitmReducer;
