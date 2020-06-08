/**
 * External dependencies
 */
import i18n, { translate } from 'i18n-calypso';
import interpolateComponents from 'interpolate-components';

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

export function enableLanguageEmpatyhMode() {
	// wrap translations from i18n
	i18n.registerTranslateHook( ( translation, options ) => {
		const locale = i18n.getLocaleSlug();
		if ( 'en' === locale || options.original === defaultUntranslatedPlacehoder ) {
			return translation;
		}

		if ( i18n.hasTranslation( options.original ) ) {
			if ( options.components ) {
				translation = interpolateComponents( {
					mixedString: options.original,
					components: options.components,
				} );
			} else {
				translation = options.original;
			}

			return translation;
		}
		return '👉 ' + encodeUntranslatedString( options.original );
	} );
}
