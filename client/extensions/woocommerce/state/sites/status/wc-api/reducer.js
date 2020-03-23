/**
 * Internal dependencies
 */

import { combineReducers } from 'state/utils';
import error from './error-reducer';

export default combineReducers( {
	error,
} );
