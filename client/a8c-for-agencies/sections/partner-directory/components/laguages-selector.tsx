import { FormTokenField } from '@wordpress/components';
import { TokenItem } from '@wordpress/components/build-types/form-token-field/types';

type Props = {
	setLanguages: ( tokens: ( string | TokenItem )[] ) => void;
	selectedLanguages: string[] | undefined;
};

const LanguagesSelector = ( { setLanguages, selectedLanguages }: Props ) => {
	// todo: add the language ISO codes as object index
	const availableLanguages = [
		'Afrikaans',
		'Albanian',
		'Amharic',
		'Arabic',
		'Armenian',
		'Azerbaijani',
		'Basque',
		'Belarusian',
		'Bengali',
		'Bosnian',
		'Bulgarian',
		'Catalan',
		'Cebuano',
		'Chichewa',
		'Chinese',
		'Corsican',
		'Croatian',
		'Czech',
		'Danish',
		'Dutch',
		'English',
		'Esperanto',
		'Estonian',
		'Filipino',
		'Finnish',
		'French',
		'Frisian',
		'Galician',
		'Georgian',
		'German',
		'Greek',
		'Gujarati',
		'Haitian Creole',
		'Hausa',
		'Hawaiian',
		'Hebrew',
		'Hindi',
		'Hmong',
		'Hungarian',
		'Icelandic',
		'Igbo',
		'Indonesian',
		'Irish',
		'Italian',
		'Japanese',
		'Javanese',
		'Kannada',
		'Kazakh',
		'Khmer',
		'Kinyarwanda',
		'Korean',
		'Kurdish (Kurmanji)',
		'Kyrgyz',
		'Lao',
		'Latin',
		'Latvian',
		'Lithuanian',
		'Luxembourgish',
		'Macedonian',
		'Malagasy',
		'Malay',
		'Malayalam',
		'Maltese',
		'Maori',
		'Marathi',
		'Mongolian',
		'Myanmar (Burmese)',
		'Nepali',
		'Norwegian',
		'Odia (Oriya)',
		'Pashto',
		'Persian',
		'Polish',
		'Portuguese',
		'Punjabi',
		'Romanian',
		'Russian',
		'Samoan',
		'Scots Gaelic',
		'Serbian',
		'Sesotho',
		'Shona',
		'Sindhi',
		'Sinhala',
		'Slovak',
		'Slovenian',
		'Somali',
		'Spanish',
		'Sundanese',
		'Swahili',
		'Swedish',
		'Tajik',
		'Tamil',
		'Tatar',
		'Telugu',
		'Thai',
		'Turkish',
		'Ukrainian',
		'Urdu',
		'Uyghur',
		'Uzbek',
		'Vietnamese',
		'Welsh',
		'Xhosa',
		'Yiddish',
		'Yoruba',
		'Zulu',
	];

	return (
		<FormTokenField
			__experimentalAutoSelectFirstMatch
			__experimentalExpandOnFocus
			__experimentalShowHowTo={ false }
			__nextHasNoMarginBottom
			label=""
			onChange={ setLanguages }
			suggestions={ availableLanguages }
			value={ selectedLanguages }
		/>
	);
};

export default LanguagesSelector;
