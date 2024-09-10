import languages from '@automattic/languages';

export const availableLanguages = languages.reduce( ( acc: Record< string, string >, lang ) => {
	acc[ lang.langSlug ] = lang.name;
	return acc;
}, {} );

export function findIsoCodeByLanguage( language: string ) {
	for ( const [ key, value ] of Object.entries( availableLanguages ) ) {
		if ( value.toLowerCase() === language.toLowerCase() ) {
			return key;
		}
	}
	return null;
}
