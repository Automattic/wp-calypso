/**
 * External dependencies
 */
import { deburr } from 'lodash';

/**
 * Internal dependencies
 */
import { Language } from './Language';

type SearchableFields = string[];
export type LocalizedLanguageNames = { [ slug: string ]: { localized: string; en: string } };

const getSearchableFields = (
	language: Language,
	localizedLanguageNames?: LocalizedLanguageNames
): SearchableFields =>
	[
		deburr( language.name ),
		language.langSlug,
		deburr( localizedLanguageNames?.[ language.langSlug ]?.localized ),
		deburr( localizedLanguageNames?.[ language.langSlug ]?.en ),
	].map( ( s ) => s.toLowerCase() );

export const getSearchedLanguages = (
	languages: Language[],
	search: string,
	localizedLanguageNames?: LocalizedLanguageNames
): Language[] => {
	const searchString = deburr( search ).toLowerCase();
	return languages.filter( ( language ) =>
		getSearchableFields( language, localizedLanguageNames ).some( ( name ) =>
			name.includes( searchString )
		)
	);
};
