/**
 * External dependencies
 *
 */

/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import path from './path/reducer';
import query from './query/reducer';

const route = combineReducers( {
	path,
	query,
} );

export default route;
