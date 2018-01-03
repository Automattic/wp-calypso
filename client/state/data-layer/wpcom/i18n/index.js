/** @format */
/**
 * Internal dependencies
 */
import { mergeHandlers } from 'state/action-watchers/utils';
import languageNames from './language-names';
import localeSuggestions from './locale-suggestions';

export default mergeHandlers( localeSuggestions, languageNames );
