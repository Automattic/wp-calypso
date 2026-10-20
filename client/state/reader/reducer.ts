import { withStorageKey } from '@automattic/state-utils';
import { combineReducers } from 'calypso/state/utils';
import conversations from './conversations/reducer';
import siteBlocks from './site-blocks/reducer';

const combinedReducer = combineReducers( {
	conversations,
	siteBlocks,
} );
const readerReducer = withStorageKey( 'reader', combinedReducer );
export default readerReducer;
