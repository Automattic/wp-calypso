import { withStorageKey } from '@automattic/state-utils';
import { combineReducers } from 'calypso/state/utils';
import dns from './dns/reducer';
import management from './management/reducer';
import notices from './notices/reducer';
import siteRedirect from './site-redirect/reducer';
import suggestions from './suggestions/reducer';
import transfer from './transfer/reducer';

const combinedReducer = combineReducers( {
	dns,
	management,
	notices,
	siteRedirect,
	suggestions,
	transfer,
} );

const domainsReducer = withStorageKey( 'domains', combinedReducer );
export default domainsReducer;
