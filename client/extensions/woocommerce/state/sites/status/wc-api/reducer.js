/**
 * Internal dependencies
 */
import error from './error-reducer';
import { combineReducers } from 'state/utils';

export default combineReducers( {
	error,
} );

