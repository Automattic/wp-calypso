import { FormTokenField } from '@wordpress/components';
import { TokenItem } from '@wordpress/components/build-types/form-token-field/types';

type Props = {
	setLanguages: ( tokens: ( string | TokenItem )[] ) => void;
	selectedLanguages: string[] | undefined;
};

const LanguagesSelector = ( { setLanguages, selectedLanguages }: Props ) => {
	const availableLanguages: Record< string, string > = {
		af: 'Afrikaans',
		sq: 'Albanian',
		am: 'Amharic',
		ar: 'Arabic',
		hy: 'Armenian',
		az: 'Azerbaijani',
		eu: 'Basque',
		be: 'Belarusian',
		bn: 'Bengali',
		bs: 'Bosnian',
		bg: 'Bulgarian',
		ca: 'Catalan',
		ceb: 'Cebuano',
		ny: 'Chichewa',
		zh: 'Chinese',
		co: 'Corsican',
		hr: 'Croatian',
		cs: 'Czech',
		da: 'Danish',
		nl: 'Dutch',
		en: 'English',
		eo: 'Esperanto',
		et: 'Estonian',
		tl: 'Filipino',
		fi: 'Finnish',
		fr: 'French',
		fy: 'Frisian',
		gl: 'Galician',
		ka: 'Georgian',
		de: 'German',
		el: 'Greek',
		gu: 'Gujarati',
		ht: 'Haitian Creole',
		ha: 'Hausa',
		haw: 'Hawaiian',
		he: 'Hebrew',
		hi: 'Hindi',
		hmn: 'Hmong',
		hu: 'Hungarian',
		is: 'Icelandic',
		ig: 'Igbo',
		id: 'Indonesian',
		ga: 'Irish',
		it: 'Italian',
		ja: 'Japanese',
		jw: 'Javanese',
		kn: 'Kannada',
		kk: 'Kazakh',
		km: 'Khmer',
		rw: 'Kinyarwanda',
		ko: 'Korean',
		ku: 'Kurdish (Kurmanji)',
		ky: 'Kyrgyz',
		lo: 'Lao',
		la: 'Latin',
		lv: 'Latvian',
		lt: 'Lithuanian',
		lb: 'Luxembourgish',
		mk: 'Macedonian',
		mg: 'Malagasy',
		ms: 'Malay',
		ml: 'Malayalam',
		mt: 'Maltese',
		mi: 'Maori',
		mr: 'Marathi',
		mn: 'Mongolian',
		my: 'Myanmar (Burmese)',
		ne: 'Nepali',
		no: 'Norwegian',
		or: 'Odia (Oriya)',
		ps: 'Pashto',
		fa: 'Persian',
		pl: 'Polish',
		pt: 'Portuguese',
		pa: 'Punjabi',
		ro: 'Romanian',
		ru: 'Russian',
		sm: 'Samoan',
		gd: 'Scots Gaelic',
		sr: 'Serbian',
		st: 'Sesotho',
		sn: 'Shona',
		sd: 'Sindhi',
		si: 'Sinhala',
		sk: 'Slovak',
		sl: 'Slovenian',
		so: 'Somali',
		es: 'Spanish',
		su: 'Sundanese',
		sw: 'Swahili',
		sv: 'Swedish',
		tg: 'Tajik',
		ta: 'Tamil',
		tt: 'Tatar',
		te: 'Telugu',
		th: 'Thai',
		tr: 'Turkish',
		uk: 'Ukrainian',
		ur: 'Urdu',
		ug: 'Uyghur',
		uz: 'Uzbek',
		vi: 'Vietnamese',
		cy: 'Welsh',
		xh: 'Xhosa',
		yi: 'Yiddish',
		yo: 'Yoruba',
		zu: 'Zulu',
	};

	// It converts the values selected into their keys
	const setLanguagesByCode = ( codes: ( string | TokenItem )[] ) => {
		const selectedLanguagesByCode = codes.filter( ( code ) => {
			return Object.keys( availableLanguages ).find(
				( key: string ) => availableLanguages?.[ key ] === code
			);
		} );

		setLanguages( selectedLanguagesByCode );
	};

	return (
		<FormTokenField
			__experimentalAutoSelectFirstMatch
			__experimentalExpandOnFocus
			__experimentalShowHowTo={ false }
			__nextHasNoMarginBottom
			onChange={ setLanguagesByCode }
			suggestions={ Object.values( availableLanguages ) }
			value={ selectedLanguages }
		/>
	);
};

export default LanguagesSelector;
