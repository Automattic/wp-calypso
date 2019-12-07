/** @format */

/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import languageNames from './language-names/reducer';
import localeSuggestions from './locale-suggestions/reducer';

export default combineReducers( {
	languageNames,
	localeSuggestions,
} );
