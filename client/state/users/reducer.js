/**
 * Internal dependencies
 */
import { combineReducers } from 'calypso/state/utils';
import suggestions from './suggestions/reducer';

export default combineReducers( {
	suggestions,
} );
