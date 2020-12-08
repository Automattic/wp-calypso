/**
 * Internal dependencies
 */
import { combineReducers, withStorageKey } from 'calypso/state/utils';
import lists from './lists/reducer';
import settings from './settings/reducer';

const combinedReducer = combineReducers( {
	lists,
	settings,
} );

const mailchimpReducer = withStorageKey( 'mailchimp', combinedReducer );
export default mailchimpReducer;
