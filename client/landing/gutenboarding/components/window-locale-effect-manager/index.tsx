/**
 * External dependencies
 */
import { switchWebpackCSS } from '../../../../lib/i18n-utils/switch-locale';
import { useI18n } from '@automattic/react-i18n';
import * as React from 'react';

export const WindowLocaleEffectManager: React.FunctionComponent = () => {
	const { __, isRTL, i18nLocale } = useI18n();

	// Some languages may need to set an html lang attribute that is different from their slug
	let lang = __( 'html_lang_attribute' );

	// Some languages don't have the translation for html_lang_attribute
	// or maybe we are dealing with the default `en` locale. Return the general purpose locale slug
	if ( lang === 'html_lang_attribute' ) {
		lang = i18nLocale;
	}

	React.useEffect( () => {
		document.documentElement.lang = lang;
	}, [ lang ] );

	const isRtl = isRTL();

	React.useEffect( () => {
		document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
		document.body.classList[ isRtl ? 'add' : 'remove' ]( 'rtl' );
		switchWebpackCSS( isRtl );
	}, [ isRtl ] );

	return null;
};
