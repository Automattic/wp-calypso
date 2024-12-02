import { recordTracksEvent } from '@automattic/calypso-analytics';
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

function getSitePlugin( plugin, siteId, pluginsOnSites ) {
	return {
		...plugin,
		...pluginsOnSites[ plugin.slug ]?.sites[ siteId ],
	};
}

export function handleUpdatePlugins( plugins, updateAction, pluginsOnSites ) {
	const updatedPlugins = new Set();
	const updatedSites = new Set();

	plugins
		// only consider plugins needing an update
		.filter( ( plugin ) => plugin.update )
		.forEach( ( plugin ) => {
			Object.entries( plugin.sites )
				// only consider the sites where the those plugins are installed
				.filter( ( [ , sitePlugin ] ) => sitePlugin.update?.new_version )
				.forEach( ( [ siteId ] ) => {
					updatedPlugins.add( plugin.slug );
					updatedSites.add( siteId );
					const sitePlugin = getSitePlugin( plugin, siteId, pluginsOnSites );
					return updateAction( siteId, sitePlugin );
				} );
		} );

	recordTracksEvent( 'calypso_plugins_bulk_action_execute', {
		action: 'updating',
		plugins: [ ...updatedPlugins ].join( ',' ),
		sites: [ ...updatedSites ].join( ',' ),
	} );
}

export function useServerEffect( fn ) {
	if ( 'undefined' === typeof window ) {
		fn();
	}
}
