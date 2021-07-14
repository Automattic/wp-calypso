/**
 * External dependencies
 */
import { withStorageKey } from '@automattic/state-utils';

/**
 * Internal dependencies
 */
import { combineReducers } from 'calypso/state/utils';
import languageNames from './language-names/reducer';
import localeSuggestions from './locale-suggestions/reducer';

export default withStorageKey(
	'i18n',
	combineReducers( {
		languageNames,
		localeSuggestions,
	} )
);
