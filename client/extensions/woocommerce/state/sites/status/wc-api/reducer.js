/** @format */

/**
 * Internal dependencies
 */

import { combineReducers } from 'client/state/utils';
import error from './error-reducer';

export default combineReducers( {
	error,
} );
