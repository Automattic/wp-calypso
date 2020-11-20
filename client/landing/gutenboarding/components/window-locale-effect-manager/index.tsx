/**
 * External dependencies
 */
import { switchWebpackCSS } from '../../../../lib/i18n-utils/switch-locale';
import { useI18n } from '@automattic/react-i18n';
import * as React from 'react';
import { useLocale } from '@automattic/i18n-utils';

export const WindowLocaleEffectManager: React.FunctionComponent = () => {
	const { __, isRTL } = useI18n();
	const locale = useLocale();

	// Some languages may need to set an html lang attribute that is different from their slug
	let lang = __( 'html_lang_attribute' );

	// Some languages don't have the translation for html_lang_attribute
	// or maybe we are dealing with the default `en` locale. Return the general purpose locale slug
	if ( lang === 'html_lang_attribute' ) {
		lang = locale;
	}

	React.useEffect( () => {
		document.documentElement.lang = lang;
	}, [ lang ] );

	// This line is required to make `isRTL()` work as expected for chunked translations:
	// The `./bin/build-languages.js` script scans our codebase for calls to __() and puts only the neccessary strings
	// in `./calypso-strings.pot`. Internally, isRTL() uses the translation for `ltr` to determine the text direction.
	// But because isRTL is defined in the `@wordpress/i18n` package, our `./bin/build-languages.js` script
	// does not know to include `ltr` in `./calypso-strings.pot`.
	// see https://github.com/Automattic/wp-calypso/pull/43132#discussion_r448537345
	__( 'ltr', { context: 'text direction' } );

	const isRtl = isRTL();

	React.useEffect( () => {
		document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
		document.body.classList[ isRtl ? 'add' : 'remove' ]( 'rtl' );
		switchWebpackCSS( isRtl );
	}, [ isRtl ] );

	return null;
};
