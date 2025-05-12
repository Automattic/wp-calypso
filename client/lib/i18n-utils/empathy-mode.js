import { I18N, translate } from 'i18n-calypso';
import { getI18n } from './i18n';

let defaultUntranslatedPlacehoder = translate( "I don't understand" );

// keep `defaultUntranslatedPlacehoder` in sync with i18n changes
getI18n().on( 'change', () => {
	defaultUntranslatedPlacehoder = translate( "I don't understand" );
} );

function encodeUntranslatedString( originalString, placeholder = defaultUntranslatedPlacehoder ) {
	let output = placeholder;

	while ( output.length < originalString.length ) {
		output += ' ' + placeholder;
	}

	return output.substr( 0, originalString.length );
}

let isActive = false;
let isInitialized = false;

export function toggleLanguageEmpathyMode( state ) {
	isActive = typeof state === 'boolean' ? state : ! isActive;

	if ( ! isInitialized && isActive ) {
		initLanguageEmpathyMode();
	}

	getI18n().reRenderTranslations();
}

export function getLanguageEmpathyModeActive() {
	return isActive;
}

export function initLanguageEmpathyMode() {
	const i18nEmpathy = new I18N();
	const i18nEmpathyTranslate = i18nEmpathy.translate.bind( i18nEmpathy );
	const i18nEmpathyRegisterHook = i18nEmpathy.registerTranslateHook.bind( i18nEmpathy );
	const availableEmpathyTranslations = [ defaultUntranslatedPlacehoder ];

	getI18n().translateHooks.forEach( i18nEmpathyRegisterHook );

	// wrap translations from i18n
	getI18n().registerTranslateHook( ( translation, options ) => {
		const locale = getI18n().getLocaleSlug();
		if (
			! isActive ||
			locale === getI18n().defaultLocaleSlug ||
			availableEmpathyTranslations.includes( options.original )
		) {
			return translation;
		}

		if ( getI18n().hasTranslation( options ) ) {
			return i18nEmpathyTranslate( options );
		}
		return '👉 ' + encodeUntranslatedString( options.original );
	} );

	isInitialized = true;
	isActive = true;
}
