/**
 * Internal dependencies
 */
import dns from './dns/reducer';
import management from './management/reducer';
import siteRedirect from './site-redirect/reducer';
import suggestions from './suggestions/reducer';
import transfer from './transfer/reducer';
import { combineReducers } from 'state/utils';

export default combineReducers( {
	dns,
	management,
	siteRedirect,
	suggestions,
	transfer,
} );
