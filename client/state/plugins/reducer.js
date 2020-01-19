/**
 * Internal dependencies
 */

import wporg from './wporg/reducer';
import { combineReducers } from 'state/utils';
import premium from './premium/reducer';
import installed from './installed/reducer';
import upload from './upload/reducer';
import recommended from './recommended/reducer';

export default combineReducers( {
	wporg,
	premium,
	installed,
	upload,
	recommended,
} );
