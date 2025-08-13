import languages from '@automattic/languages';
import type { Language } from '@automattic/languages';

export const availableLanguages = languages.map( ( lang: Language ) => {
	return {
		value: lang.langSlug,
		label: lang.name,
	};
} );
