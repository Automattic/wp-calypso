import { withStorageKey } from '@automattic/state-utils';
import { combineReducers } from 'calypso/state/utils';
import socialProfiles from './social-profiles/reducer';

const combinedReducer = combineReducers( {
	socialProfiles,
} );

const difmReducer = withStorageKey( 'difm', combinedReducer );
export default difmReducer;
