/** @format */

/**
 * Internal dependencies
 */

import { combineReducers } from 'client/state/utils';
import taxrates from './taxrates/reducer';

export default combineReducers( {
	taxrates,
} );
