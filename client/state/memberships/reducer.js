/** @format */

/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import connectedAccounts from './connected-accounts/reducer';

export default combineReducers( {
	connectedAccounts,
} );
