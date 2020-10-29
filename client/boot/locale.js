/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'calypso/config';
import {
	getLanguageSlugs,
	isDefaultLocale,
	isTranslatedIncompletely,
} from 'calypso/lib/i18n-utils';
import { loadUserUndeployedTranslations } from 'calypso/lib/i18n-utils/switch-locale';
import { setLocale, setLocaleRawData } from 'calypso/state/ui/language/actions';
import { initLanguageEmpathyMode } from 'calypso/lib/i18n-utils/empathy-mode';

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

	if ( window.i18nLocaleStrings ) {
		// Use the locale translation data that were boostrapped by the server
		const i18nLocaleStringsObject = JSON.parse( window.i18nLocaleStrings );

		reduxStore.dispatch( setLocaleRawData( i18nLocaleStringsObject ) );
		const languageSlug = get( i18nLocaleStringsObject, [ '', 'localeSlug' ] );
		if ( languageSlug ) {
			loadUserUndeployedTranslations( languageSlug );
		}
	} else if ( currentUser && currentUser.localeSlug ) {
		if ( shouldUseFallbackLocale ) {
			// Use user locale fallback slug
			reduxStore.dispatch( setLocale( userLocaleSlug ) );
		} else {
			// Use the current user's and load traslation data with a fetch request
			reduxStore.dispatch( setLocale( currentUser.localeSlug, currentUser.localeVariant ) );
		}
	} else {
		// For logged out Calypso pages, set the locale from slug
		const pathLocaleSlug = getLocaleFromPathname();
		pathLocaleSlug && reduxStore.dispatch( setLocale( pathLocaleSlug, '' ) );
	}

	// If user is logged out and translations are not boostrapped, we assume default locale
};
