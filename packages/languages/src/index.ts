/**
 * Internal dependencies
 */
import data from './languages-meta.json';

export type LanguageSlug = string;
export type WPLocale = string;

export type BaseLanguage = {
	langSlug: LanguageSlug;
	name: string;
	popular?: number;
	rtl?: boolean;
	territories: string[];
	value: number;
	wpLocale: WPLocale | '';
};

export type SubLanguage = BaseLanguage & { parentLangSlug: string };

export type Language = BaseLanguage | SubLanguage;

export interface LanguagesBySlug {
	[ key: string ]: Language;
}

export const languagesBySlug: LanguagesBySlug = data;
export const languageSlugs: LanguageSlug[] = Object.keys( data );
export const languages: Language[] = Object.values( data );
export default languages;
