/** @format */

/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import shifts from './shifts/reducer';
import info from './info/reducer';

export default combineReducers( {
	shifts,
	info,
} );
