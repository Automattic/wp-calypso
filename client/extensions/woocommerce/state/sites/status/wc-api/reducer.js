/**
 * Internal dependencies
 */

import { combineReducers } from 'calypso/state/utils';
import error from './error-reducer';

export default combineReducers( {
	error,
} );
