/** @format */

/**
 * Internal dependencies
 */

import sidebar from './sidebar/reducer';
import { combineReducers } from 'client/state/utils';
import cardExpansions from './card-expansions/reducer';

export default combineReducers( {
	sidebar,
	cardExpansions,
} );
