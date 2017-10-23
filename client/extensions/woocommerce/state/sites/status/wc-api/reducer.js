/**
 * Internal dependencies
 *
 * @format
 */

import { combineReducers } from 'state/utils';
import error from './error-reducer';

export default combineReducers( {
	error,
} );
