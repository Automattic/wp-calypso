/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import edits from './edits-reducer';
import variations from './variations/reducer';

export default combineReducers( {
	edits,
	variations,
} );
