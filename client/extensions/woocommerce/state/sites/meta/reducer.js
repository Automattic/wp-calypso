/**
 * Internal dependencies
 *
 * @format
 */

import { combineReducers } from 'state/utils';
import taxrates from './taxrates/reducer';

export default combineReducers( {
	taxrates,
} );
