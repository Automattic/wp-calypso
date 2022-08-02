import { isMagnificentLocale } from '@automattic/i18n-utils';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

export function siteObjectsToSiteIds( sites ) {
	return sites?.map( ( site ) => site.ID ) ?? [];
}

export function getVisibleSites( sites ) {
	return sites?.filter( ( site ) => site.visible );
}

export function useLocalizedPlugins() {
	const isLoggedIn = useSelector( isUserLoggedIn );
	const { localeSlug: locale } = useTranslate();

	const localizePath = useCallback(
		( path ) => {
			const shouldPrefix =
				! isLoggedIn && isMagnificentLocale( locale ) && path.startsWith( '/plugins' );

			return shouldPrefix ? `/${ locale }${ path }` : path;
		},
		[ isLoggedIn, locale ]
	);

	return { localizePath };
}
