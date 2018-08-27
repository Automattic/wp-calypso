/** @format */

/**
 * External dependencies
 */

import { combineReducers, keyedReducer } from 'state/utils';

/**
 * Internal dependencies
 */
import zones from './zones/reducer';
import classes from './classes/reducer';

export default keyedReducer(
	'siteId',
	combineReducers( {
		zones,
		classes,
	} )
);
