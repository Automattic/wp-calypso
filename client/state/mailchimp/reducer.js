/**
 * Internal dependencies
 */
import { withStorageKey } from '@automattic/state-utils';
import { combineReducers } from 'calypso/state/utils';
import lists from './lists/reducer';
import settings from './settings/reducer';

const combinedReducer = combineReducers( {
	lists,
	settings,
} );

const mailchimpReducer = withStorageKey( 'mailchimp', combinedReducer );
export default mailchimpReducer;
