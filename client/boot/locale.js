import config from '@automattic/calypso-config';
import i18n from 'i18n-calypso';
import {
	getLanguageSlugs,
	isDefaultLocale,
	isTranslatedIncompletely,
} from 'calypso/lib/i18n-utils';
import { initLanguageEmpathyMode } from 'calypso/lib/i18n-utils/empathy-mode';
import { loadUserUndeployedTranslations, switchLocale } from 'calypso/lib/i18n-utils/switch-locale';
import { setLocale } from 'calypso/state/ui/language/actions';

function getLocaleFromPathname() {
	const pathname = window.location.pathname.replace( /\/$/, '' );
	const lastPathSegment = pathname.substr( pathname.lastIndexOf( '/' ) + 1 );
	const pathLocaleSlug =
		getLanguageSlugs().includes( lastPathSegment ) &&
		! isDefaultLocale( lastPathSegment ) &&
		lastPathSegment;
	return pathLocaleSlug;
}

export const setupLocale = ( currentUser, reduxStore ) => {
	if ( config.isEnabled( 'i18n/empathy-mode' ) && currentUser.i18n_empathy_mode ) {
		initLanguageEmpathyMode();
	}

	let userLocaleSlug = currentUser.localeVariant || currentUser.localeSlug;
	const shouldUseFallbackLocale =
		currentUser?.use_fallback_for_incomplete_languages &&
		isTranslatedIncompletely( userLocaleSlug );

	if ( shouldUseFallbackLocale ) {
		userLocaleSlug = config( 'i18n_default_locale_slug' );
	}

	const bootstrappedLocaleSlug = window?.i18nLanguageManifest?.locale?.[ '' ]?.localeSlug;

	if ( window.i18nLocaleStrings ) {
		// Use the locale translation data that were boostrapped by the server
		const i18nLocaleStringsObject = JSON.parse( window.i18nLocaleStrings );

		i18n.setLocale( i18nLocaleStringsObject );
		const { localeSlug, localeVariant } = i18nLocaleStringsObject[ '' ];
		reduxStore.dispatch( setLocale( localeSlug, localeVariant ) );

		// The empty string key [ '' ] where metadata about the translation file
		// (e.g., the locale name, plurals definitions, etc.) are stored.
		const languageSlug = i18nLocaleStringsObject?.[ '' ]?.localeSlug;
		if ( languageSlug ) {
			loadUserUndeployedTranslations( languageSlug );
		}
	} else if ( currentUser && currentUser.localeSlug ) {
		if ( shouldUseFallbackLocale ) {
			// Use user locale fallback slug
			reduxStore.dispatch( switchLocale( userLocaleSlug ) );
		} else {
			// Use the current user's and load translation data with a fetch request
			reduxStore.dispatch( switchLocale( currentUser.localeSlug, currentUser.localeVariant ) );
		}
	} else if ( bootstrappedLocaleSlug ) {
		// Use locale slug from bootstrapped language manifest object
		reduxStore.dispatch( switchLocale( bootstrappedLocaleSlug ) );
	} else {
		// For logged out Calypso pages, set the locale from slug
		const pathLocaleSlug = getLocaleFromPathname();
		pathLocaleSlug && reduxStore.dispatch( switchLocale( pathLocaleSlug, '' ) );
	}

	// If user is logged out and translations are not bootstrapped, we assume default locale
};
