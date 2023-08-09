import { withStorageKey } from '@automattic/state-utils';
import { combineReducers } from 'calypso/state/utils';
import dns from './dns/reducer';
import domainRedirect from './domain-redirects/reducer';
import management from './management/reducer';
import siteRedirect from './site-redirect/reducer';
import suggestions from './suggestions/reducer';
import transfer from './transfer/reducer';

const combinedReducer = combineReducers( {
	dns,
	management,
	siteRedirect,
	domainRedirect,
	suggestions,
	transfer,
} );

const domainsReducer = withStorageKey( 'domains', combinedReducer );
export default domainsReducer;
