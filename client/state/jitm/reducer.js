/**
 * Internal dependencies
 */
import { JITM_SET } from 'state/action-types';
import { combineReducers, keyedReducer } from 'state/utils';

export const storeJITM = ( state = {}, { type, jitms } ) => ( type === JITM_SET ? jitms : state) ;

const sitePathJITM = keyedReducer( 'keyedPath', storeJITM );

export default combineReducers( {
	sitePathJITM,
} );
