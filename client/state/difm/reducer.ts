import { withStorageKey } from '@automattic/state-utils';
import { combineReducers } from 'calypso/state/utils';

const combinedReducer = combineReducers( {} );

const difmReducer = withStorageKey( 'difm', combinedReducer );
export default difmReducer;
