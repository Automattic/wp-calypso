/**
 * Internal dependencies
 */
import dns from './dns/reducer';
import management from './management/reducer';
import nameservers from './nameservers/reducer';
import siteRedirect from './site-redirect/reducer';
import suggestions from './suggestions/reducer';
import transfer from './transfer/reducer';
import { combineReducers, withStorageKey } from 'calypso/state/utils';

const combinedReducer = combineReducers( {
	dns,
	management,
	nameservers,
	siteRedirect,
	suggestions,
	transfer,
} );

const domainsReducer = withStorageKey( 'domains', combinedReducer );
export default domainsReducer;
