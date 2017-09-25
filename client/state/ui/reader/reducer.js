/**
 * Internal dependencies
 */
import cardExpansions from './card-expansions/reducer';
import sidebar from './sidebar/reducer';
import { combineReducers } from 'state/utils';

export default combineReducers( {
	sidebar,
	cardExpansions,
} );
