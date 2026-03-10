export const availableLanguages: Record< string, string > = {
	ar: 'Arabic',
	bn: 'Bengali',
	zh: 'Chinese (Simplified)',
	'zh-TW': 'Chinese (Traditional)',
	hr: 'Croatian',
	cs: 'Czech',
	da: 'Danish',
	nl: 'Dutch',
	en: 'English',
	et: 'Estonian',
	fi: 'Finnish',
	fr: 'French',
	de: 'German',
	el: 'Greek',
	he: 'Hebrew',
	hi: 'Hindi',
	hu: 'Hungarian',
	id: 'Indonesian',
	it: 'Italian',
	ja: 'Japanese',
	ko: 'Korean',
	lv: 'Latvian',
	lt: 'Lithuanian',
	ms: 'Malay',
	no: 'Norwegian',
	fa: 'Persian / Farsi',
	pl: 'Polish',
	pt: 'Portuguese',
	ro: 'Romanian',
	ru: 'Russian',
	sr: 'Serbian',
	sk: 'Slovak',
	sl: 'Slovenian',
	es: 'Spanish',
	sv: 'Swedish',
	th: 'Thai',
	tr: 'Turkish',
	uk: 'Ukrainian',
	vi: 'Vietnamese',
};

export function findIsoCodeByLanguage( language: string ) {
	for ( const [ key, value ] of Object.entries( availableLanguages ) ) {
		if ( value.toLowerCase() === language.toLowerCase() ) {
			return key;
		}
	}
	return null;
}
