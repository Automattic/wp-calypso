/** @format */
/**
 * External dependencies
 */

import i18n from 'i18n-calypso';
import interpolateComponents from 'interpolate-components';

export function enableLanguageEmpatyhMode() {
	// wrap translations from i18n
	i18n.registerTranslateHook( ( translation, options ) => {
		const locale = i18n.getLocaleSlug();
		if ( 'en' === locale ) {
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
		return locale + '-untranslated';
	} );
}
