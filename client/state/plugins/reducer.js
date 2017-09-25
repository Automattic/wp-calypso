/**
 * Internal dependencies
 */
import installed from './installed/reducer';
import premium from './premium/reducer';
import upload from './upload/reducer';
import wporg from './wporg/reducer';
import { combineReducers } from 'state/utils';

export default combineReducers( {
	wporg,
	premium,
	installed,
	upload,
} );
