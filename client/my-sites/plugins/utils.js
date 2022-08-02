import { isMagnificentLocale } from '@automattic/i18n-utils';

export function siteObjectsToSiteIds( sites ) {
	return sites?.map( ( site ) => site.ID ) ?? [];
}

export function getVisibleSites( sites ) {
	return sites?.filter( ( site ) => site.visible );
}

export function localizePluginsPath( path, locale, isLoggedOut = true ) {
	const shouldPrefix =
		isLoggedOut && isMagnificentLocale( locale ) && path.startsWith( '/plugins' );

	return shouldPrefix ? `/${ locale }${ path }` : path;
}
