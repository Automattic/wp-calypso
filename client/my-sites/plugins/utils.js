import { isMagnificentLocale } from '@automattic/i18n-utils';
import { createSelector } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';

export const siteObjectsToSiteIds = createSelector(
	( sites ) => sites?.map( ( site ) => site.ID ) ?? []
);

export function getVisibleSites( sites ) {
	return sites?.filter( ( site ) => site.visible );
}

export function useLocalizedPlugins() {
	const isLoggedIn = useSelector( isUserLoggedIn );
	// eslint-disable-next-line wpcalypso/i18n-translate-identifier
	const { localeSlug } = useTranslate();

	const localizePath = useCallback(
		( path ) => {
			const shouldPrefix =
				! isLoggedIn && isMagnificentLocale( localeSlug ) && path.startsWith( '/plugins' );

			return shouldPrefix ? `/${ localeSlug }${ path }` : path;
		},
		[ isLoggedIn, localeSlug ]
	);

	return { localizePath };
}

export function useServerEffect( fn ) {
	if ( 'undefined' === typeof window ) {
		fn();
	}
}
