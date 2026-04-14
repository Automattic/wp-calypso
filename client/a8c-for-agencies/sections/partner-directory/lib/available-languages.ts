export const availableLanguages: Record< string, string > = {
	en: 'English',
	es: 'Spanish',
	fr: 'French',
	de: 'German',
	pt: 'Portuguese',
	it: 'Italian',
	nl: 'Dutch',
	ja: 'Japanese',
	zh: 'Chinese',
	ko: 'Korean',
	ar: 'Arabic',
	hi: 'Hindi',
};

export function findIsoCodeByLanguage( language: string ) {
	for ( const [ key, value ] of Object.entries( availableLanguages ) ) {
		if ( value.toLowerCase() === language.toLowerCase() ) {
			return key;
		}
	}
	return null;
}
