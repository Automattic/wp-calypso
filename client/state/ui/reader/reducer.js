/**
 * Internal dependencies
 */
import sidebar from './sidebar/reducer';
import { combineReducersWithPersistence } from 'state/utils';
import cardExpansions from './card-expansions/reducer';

export default combineReducersWithPersistence( {
	sidebar,
	cardExpansions,
} );
