/**
 * Internal dependencies
 */
import dns from './dns/reducer';
import management from './management/reducer';
import siteRedirect from './site-redirect/reducer';
import suggestions from './suggestions/reducer';
import transfer from './transfer/reducer';
import { combineReducers, withStorageKey } from 'state/utils';

const combinedReducer = combineReducers( {
	dns,
	management,
	siteRedirect,
	suggestions,
	transfer,
} );

const domainsReducer = withStorageKey( 'domains', combinedReducer );
export default domainsReducer;
