import config from '@automattic/calypso-config';
import { isTranslatedIncompletely } from '@automattic/i18n-utils';
import i18n from 'i18n-calypso';
import { initLanguageEmpathyMode } from 'calypso/lib/i18n-utils/empathy-mode';
import { loadUserUndeployedTranslations } from 'calypso/lib/i18n-utils/switch-locale';
import { LOCALE_SET } from 'calypso/state/action-types';
import { setLocale } from 'calypso/state/ui/language/actions';

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
	}
	// else
	// If user is logged out and translations are not bootstrapped, we assume default locale.
	// Also, some logged out routes now choose to override this locale using a lang path param,
	// for these routes, setLocale is dispatched inside setLocaleMiddleware (client/controller/shared.js)
};
