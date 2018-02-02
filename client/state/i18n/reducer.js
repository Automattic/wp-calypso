/** @format */

/**
 * Internal dependencies
 */
import { combineReducers } from 'state/utils';
import languageNames from './language-names/reducer';
import localeSuggestions from './locale-suggestions/reducer';
import communityTranslator from './community-translator/reducer';

export default combineReducers( {
	communityTranslator,
	languageNames,
	localeSuggestions,
} );
