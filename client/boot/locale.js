import config from '@automattic/calypso-config';
import i18n from 'i18n-calypso';
import {
	getLanguageSlugs,
	isDefaultLocale,
	isTranslatedIncompletely,
} from 'calypso/lib/i18n-utils';
import { initLanguageEmpathyMode } from 'calypso/lib/i18n-utils/empathy-mode';
import { loadUserUndeployedTranslations } from 'calypso/lib/i18n-utils/switch-locale';
import { LOCALE_SET } from 'calypso/state/action-types';
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

	const bootstrappedLocaleSlug = window?.i18nLanguageManifest?.locale?.[ '' ]?.localeSlug;

	if ( window.i18nLocaleStrings ) {
		// Use the locale translation data that were bootstrapped by the server
		const localeData = JSON.parse( window.i18nLocaleStrings );

		i18n.setLocale( localeData );
		const localeSlug = i18n.getLocaleSlug();
		const localeVariant = i18n.getLocaleVariant();
		reduxStore.dispatch( { type: LOCALE_SET, localeSlug, localeVariant } );

		if ( localeSlug ) {
			loadUserUndeployedTranslations( localeSlug );
		}
	} else if ( currentUser && currentUser.localeSlug ) {
		if (
			currentUser.use_fallback_for_incomplete_languages &&
			isTranslatedIncompletely( currentUser.localeVariant || currentUser.localeSlug )
		) {
			// Use user locale fallback slug
			reduxStore.dispatch( setLocale( config( 'i18n_default_locale_slug' ) ) );
		} else {
			// Use the current user's and load translation data with a fetch request
			reduxStore.dispatch( setLocale( currentUser.localeSlug, currentUser.localeVariant ) );
		}
	} else if ( bootstrappedLocaleSlug ) {
		// Use locale slug from bootstrapped language manifest object
		reduxStore.dispatch( setLocale( bootstrappedLocaleSlug ) );
	} else {
		// For logged out Calypso pages, set the locale from slug
		const pathLocaleSlug = getLocaleFromPathname();
		pathLocaleSlug && reduxStore.dispatch( setLocale( pathLocaleSlug, '' ) );
	}

	// If user is logged out and translations are not bootstrapped, we assume default locale
};
