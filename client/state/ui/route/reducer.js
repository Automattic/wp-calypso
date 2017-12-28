/**
 * External dependencies
 *
 * @format
 */

/**
 * Internal dependencies
 */
import { combineReducers } from 'client/state/utils';
import path from './path/reducer';
import query from './query/reducer';

const route = combineReducers( {
	path,
	query,
} );

export default route;
