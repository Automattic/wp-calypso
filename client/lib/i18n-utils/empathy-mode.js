/**
 * External dependencies
 */
import i18n, { I18N, translate } from 'i18n-calypso';

let defaultUntranslatedPlacehoder = translate( "I don't understand" );

// keep `defaultUntranslatedPlacehoder` in sync with i18n changes
i18n.on( 'change', () => {
	defaultUntranslatedPlacehoder = translate( "I don't understand" );
} );

function encodeUntranslatedString( originalString, placeholder = defaultUntranslatedPlacehoder ) {
	let output = placeholder;

	while ( output.length < originalString.length ) {
		output += ' ' + placeholder;
	}

	return output.substr( 0, originalString.length );
}

let isDisabled = false;

export function disableLanguageEmpathyMode() {
	isDisabled = ! isDisabled;
	i18n.reRenderTranslations();
}

export function enableLanguageEmpathyMode() {
	const i18nEmpathy = new I18N();
	const i18nEmpathyTranslate = i18nEmpathy.translate.bind( i18nEmpathy );
	const i18nEmpathyRegisterHook = i18nEmpathy.registerTranslateHook.bind( i18nEmpathy );

	i18n.translateHooks.forEach( i18nEmpathyRegisterHook );

	// wrap translations from i18n
	i18n.registerTranslateHook( ( translation, options ) => {
		const locale = i18n.getLocaleSlug();
		if (
			isDisabled ||
			locale === i18n.defaultLocaleSlug ||
			options.original === defaultUntranslatedPlacehoder
		) {
			return translation;
		}

		if ( i18n.hasTranslation( options ) ) {
			return i18nEmpathyTranslate( options );
		}
		return '👉 ' + encodeUntranslatedString( options.original );
	} );
}
