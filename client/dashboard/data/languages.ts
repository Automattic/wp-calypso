import languages from '@automattic/languages';
import type { Language } from '@automattic/languages';
export type LanguageOption = {
	value: string;
	label: string;
};

export const languagesAsOptions = languages.map( ( lang: Language ) => {
	return {
		value: lang.langSlug,
		label: lang.name,
	};
} );
