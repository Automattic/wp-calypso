/**
 * External dependencies
 */
import i18n, { translate } from 'i18n-calypso';
import interpolateComponents from 'interpolate-components';
import sprintf from '@tannin/sprintf';

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

function replaceArgs( translation, options ) {
	if ( options.args ) {
		const sprintfArgs = Array.isArray( options.args ) ? options.args.slice( 0 ) : [ options.args ];
		sprintfArgs.unshift( translation );
		try {
			translation = sprintf( ...sprintfArgs );
		} catch ( error ) {
			if ( ! window || ! window.console ) {
				return;
			}
			const errorMethod = this.throwErrors ? 'error' : 'warn';
			if ( typeof error !== 'string' ) {
				window.console[ errorMethod ]( error );
			} else {
				window.console[ errorMethod ]( 'i18n sprintf error:', sprintfArgs );
			}
		}
	}

	return translation;
}

let isDisabled = false;

export function disableLanguageEmpathyMode() {
	isDisabled = ! isDisabled;
	i18n.reRenderTranslations();
}

export function enableLanguageEmpathyMode() {
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

		if ( i18n.hasTranslation( options.original ) ) {
			if ( options.components ) {
				translation = interpolateComponents( {
					mixedString: replaceArgs( options.original, options ),
					components: options.components,
				} );
			} else {
				translation = replaceArgs( options.original, options );
			}

			return translation;
		}
		return '👉 ' + encodeUntranslatedString( options.original );
	} );
}
