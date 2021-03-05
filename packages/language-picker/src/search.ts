/**
 * Internal dependencies
 */
import { Language } from './Language';

type SearchableFields = string[];
export type LocalizedLanguageNames = { [ slug: string ]: { localized: string; en: string } };

const deburr = ( str?: string ) => str?.normalize( 'NFD' ).replace( /[\u0300-\u036f]/g, '' ) ?? '';
const toLowerCase = ( str: string ) => str.toLowerCase();

const getSearchableFields = < TLanguage extends Language >(
	language: TLanguage,
	localizedLanguageNames?: LocalizedLanguageNames
): SearchableFields =>
	[
		language.name,
		language.langSlug,
		localizedLanguageNames?.[ language.langSlug ]?.localized,
		localizedLanguageNames?.[ language.langSlug ]?.en,
	]
		.map( deburr )
		.map( toLowerCase );

export const getSearchedLanguages = < TLanguage extends Language >(
	languages: TLanguage[],
	search: string,
	localizedLanguageNames?: LocalizedLanguageNames
): TLanguage[] => {
	const searchString = deburr( search ).toLowerCase();
	return languages.filter( ( language ) =>
		getSearchableFields( language, localizedLanguageNames ).some( ( name ) =>
			name.includes( searchString )
		)
	);
};
