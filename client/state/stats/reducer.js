/** @format */

/**
 * Internal dependencies
 */

import posts from './posts/reducer';
import { combineReducers } from 'client/state/utils';
import lists from './lists/reducer';

export default combineReducers( {
	posts,
	lists,
} );
