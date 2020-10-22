/**
 * Internal dependencies
 */
import { JITM_SET } from 'calypso/state/action-types';
import { combineReducers, keyedReducer } from 'calypso/state/utils';

export const storeJITM = ( state = {}, { type, jitms } ) => ( type === JITM_SET ? jitms : state );

const jitmCache = ( state = null, action ) => {
	if ( action.type === JITM_SET ) {
		if ( ! action.jitms || ! action.jitms.length ) {
			return null;
		}

		return action.jitms[ 0 ];
	}
	return state;
};

const sitePathJITMCache = keyedReducer( 'siteId', jitmCache );

const sitePathJITM = keyedReducer( 'keyedPath', storeJITM );

export default combineReducers( {
	sitePathJITM,
	sitePathJITMCache,
} );
