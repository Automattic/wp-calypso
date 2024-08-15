import { mapWpI18nLangToLocaleSlug } from '@automattic/i18n-utils/src/locale-context';
import 'calypso/state/user-profile/init';

export function getAdminColor( state, siteId ) {
	return state?.userProfile?.[ siteId ]?.admin_color || null;
}

export function getLocale( state, siteId ) {
	const locale = state?.userProfile?.[ siteId ]?.locale;
	return locale ? mapWpI18nLangToLocaleSlug( locale ) : null;
}
