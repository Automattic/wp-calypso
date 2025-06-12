import i18n, { I18N, translate } from 'i18n-calypso';

let defaultUntranslatedPlacehoder = translate( "I don't understand" );

// keep `defaultUntranslatedPlacehoder` in sync with i18n changes
i18n.subscribe( () => {
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

	i18n.reRenderTranslations();
}

export function getLanguageEmpathyModeActive() {
	return isActive;
}

export function initLanguageEmpathyMode() {
	const i18nEmpathy = new I18N();
	const i18nEmpathyTranslate = i18nEmpathy.translate.bind( i18nEmpathy );
	const i18nEmpathyRegisterHook = i18nEmpathy.registerTranslateHook.bind( i18nEmpathy );
	const availableEmpathyTranslations = [ defaultUntranslatedPlacehoder ];

	i18n.translateHooks.forEach( i18nEmpathyRegisterHook );

	// wrap translations from i18n
	i18n.registerTranslateHook( ( translation, options ) => {
		const locale = i18n.getLocaleSlug();
		if (
			! isActive ||
			locale === i18n.defaultLocaleSlug ||
			availableEmpathyTranslations.includes( options.original )
		) {
			return translation;
		}

		if ( i18n.hasTranslation( options ) ) {
			return i18nEmpathyTranslate( options );
		}
		return '👉 ' + encodeUntranslatedString( options.original );
	} );

	isInitialized = true;
	isActive = true;
}
