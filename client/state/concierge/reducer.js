/** @format */

/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import shifts from './shifts/reducer';

export default combineReducers( {
	shifts,
} );
