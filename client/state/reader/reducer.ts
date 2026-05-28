import { withStorageKey } from '@automattic/state-utils';
import { combineReducers } from 'calypso/state/utils';
import conversations from './conversations/reducer';
import follows from './follows/reducer';
import recommendedSites from './recommended-sites/reducer';
import saved from './saved/reducer';
import siteBlocks from './site-blocks/reducer';

const combinedReducer = combineReducers( {
	conversations,
	follows,
	recommendedSites,
	saved,
	siteBlocks,
} );
const readerReducer = withStorageKey( 'reader', combinedReducer );
export default readerReducer;
