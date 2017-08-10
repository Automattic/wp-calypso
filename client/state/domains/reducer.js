/** @format */
/**
 * Internal dependencies
 */
import management from './management/reducer';
import suggestions from './suggestions/reducer';
import { combineReducers } from 'state/utils';

export default combineReducers( {
	management,
	suggestions,
} );
