import data from './languages-meta.json';
import type { LanguageSlug } from './language-slug';

export type { LanguageSlug };
type WPLocale = string;

type BaseLanguage = {
	langSlug: LanguageSlug;
	name: string;
	popular?: number;
	rtl?: boolean;
	territories: string[];
	value: number;
	wpLocale: WPLocale | '';
	isTranslatedIncompletely: boolean;
};

type SubLanguage = BaseLanguage & { parentLangSlug: string };

export type Language = BaseLanguage | SubLanguage;

const languages = Object.values( data ) as Language[];
const languageSlugs = languages.map( ( lang ) => lang.langSlug );

export function getLanguageSlugs(): LanguageSlug[] {
	return languageSlugs;
}

/**
 * a locale can consist of three component
 * aa: language code
 * -bb: regional code
 * _cc: variant suffix
 * while the language code is mandatory, the other two are optional.
 */
const localeRegex = /^[A-Z]{2,3}(-[A-Z]{2,3})?(_[A-Z]{2,6})?$/i;

/**
 * Matches and returns language from `languages` based on the given `langSlug`
 */
export function getLanguage( langSlug: LanguageSlug ): Language | undefined {
	if ( ! localeRegex.test( langSlug ) ) {
		return undefined;
	}

	// Find for the langSlug first. If we can't find it, split it and find its parent slug.
	// Please see the comment above `localeRegex` to see why we can split by - or _ and find the parent slug.
	const bySlug = languages.find( ( lang ) => lang.langSlug === langSlug );
	if ( bySlug ) {
		return bySlug;
	}

	const parentSlug = langSlug.split( /[-_]/ )[ 0 ];
	return languages.find( ( lang ) => lang.langSlug === parentSlug );
}

/**
 * Checks if provided locale is translated incompletely (is missing essential translations).
 */
export function isTranslatedIncompletely( langSlug: LanguageSlug ): boolean {
	return getLanguage( langSlug )?.isTranslatedIncompletely === true;
}

export default languages;
