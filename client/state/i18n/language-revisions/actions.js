/** @format */

/**
 * Internal dependencies
 */
import { I18N_SET_LANGUAGE_REVISIONS } from 'state/action-types';

export const setLanguageRevisions = languageRevisions => ( {
	type: I18N_SET_LANGUAGE_REVISIONS,
	languageRevisions,
} );
