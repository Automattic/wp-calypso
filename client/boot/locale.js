import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import {
	isDefaultLocale,
	isTranslatedIncompletely,
	getLanguageSlugs,
} from '@automattic/i18n-utils';
import { setLocale as setLocaleNumberFormatters } from '@automattic/number-formatters';
import i18n from 'i18n-calypso';
import { initLanguageEmpathyMode } from 'calypso/lib/i18n-utils/empathy-mode';
import { loadUserUndeployedTranslations } from 'calypso/lib/i18n-utils/switch-locale';
import { LOCALE_SET } from 'calypso/state/action-types';
import { setLocale } from 'calypso/state/ui/language/actions';
export function getLocaleFromPathname() {
	const pathname = window.location.pathname.replace( /\/$/, '' );
	const lastPathSegment = pathname.substr( pathname.lastIndexOf( '/' ) + 1 );
	const pathLocaleSlug =
		getLanguageSlugs().includes( lastPathSegment ) &&
		! isDefaultLocale( lastPathSegment ) &&
		lastPathSegment;
	return pathLocaleSlug;
}

export function getLocaleFromQueryParam() {
	const query = new URLSearchParams( window.location.search );
	return query.get( 'locale' );
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
		// Use the locale translation data that were bootstrapped by the server
		const localeData = JSON.parse( window.i18nLocaleStrings );

		i18n.setLocale( localeData );
		const localeSlug = i18n.getLocaleSlug();
		const localeVariant = i18n.getLocaleVariant();
		reduxStore.dispatch( { type: LOCALE_SET, localeSlug, localeVariant } );
		// Propagate the locale to @automattic/number-formatters
		setLocaleNumberFormatters( localeVariant || localeSlug );

		if ( localeSlug ) {
			loadUserUndeployedTranslations( localeSlug );
		}
	} else if ( currentUser && currentUser.localeSlug ) {
		if ( shouldUseFallbackLocale ) {
			// Use user locale fallback slug
			reduxStore.dispatch( setLocale( userLocaleSlug ) );
		} else {
			// Use the current user's and load traslation data with a fetch request
			reduxStore.dispatch( setLocale( currentUser.localeSlug, currentUser.localeVariant ) );
		}
	} else if ( bootstrappedLocaleSlug ) {
		// Use locale slug from bootstrapped language manifest object
		reduxStore.dispatch( setLocale( bootstrappedLocaleSlug ) );
	} else if ( getLocaleFromQueryParam() ) {
		// For logged out Calypso pages, set the locale from query param
		const pathLocaleSlug = getLocaleFromQueryParam();
		pathLocaleSlug && reduxStore.dispatch( setLocale( pathLocaleSlug, '' ) );
	} else if ( ! window.hasOwnProperty( 'localeFromRoute' ) ) {
		// For logged out Calypso pages, set the locale from path if we cannot get the locale from the route on the server side
		const pathLocaleSlug = getLocaleFromPathname();
		pathLocaleSlug && reduxStore.dispatch( setLocale( pathLocaleSlug, '' ) );
		recordTracksEvent( 'calypso_locale_set', { path: window.location.pathname } );
	}

	// If user is logged out and translations are not bootstrapped, we assume default locale
};
