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
};

type SubLanguage = BaseLanguage & { parentLangSlug: string };

export type Language = BaseLanguage | SubLanguage;

const languages = Object.values( data ) as Language[];

export default languages;
