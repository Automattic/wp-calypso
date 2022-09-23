import { isMagnificentLocale } from '@automattic/i18n-utils';
import { useTranslate, translate } from 'i18n-calypso';
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

// Returns translated text based on different combination of plugins and sites
const getConfirmationText = ( sites, selectedPlugins, actionText ) => {
	const pluginsList = {};
	const sitesList = {};
	let pluginName;
	let siteName;

	selectedPlugins.forEach( ( plugin ) => {
		pluginsList[ plugin.slug ] = true;
		pluginName = plugin.name || plugin.slug;

		Object.keys( plugin.sites ).forEach( ( siteId ) => {
			const site = sites.find( ( s ) => s.ID === parseInt( siteId ) );
			if ( site.canUpdateFiles ) {
				sitesList[ site.ID ] = true;
				siteName = site.title;
			}
		} );
	} );

	const pluginsListSize = Object.keys( pluginsList ).length;
	const siteListSize = Object.keys( sitesList ).length;
	const combination =
		( siteListSize > 1 ? 'n sites' : '1 site' ) +
		' ' +
		( pluginsListSize > 1 ? 'n plugins' : '1 plugin' );

	switch ( combination ) {
		case '1 site 1 plugin':
			return translate( 'You are about to %(actionText)s %(plugin)s installed on %(site)s.', {
				args: {
					actionText: actionText,
					plugin: pluginName,
					site: siteName,
				},
			} );

		case '1 site n plugins':
			return translate(
				'You are about to %(actionText)s %(numberOfPlugins)d plugins installed on %(site)s.',
				{
					args: {
						actionText: actionText,
						numberOfPlugins: pluginsListSize,
						site: siteName,
					},
				}
			);

		case 'n sites 1 plugin':
			return translate(
				'You are about to %(actionText)s %(plugin)s installed across %(numberOfSites)d sites.',
				{
					args: {
						actionText: actionText,
						plugin: pluginName,
						numberOfSites: siteListSize,
					},
				}
			);

		case 'n sites n plugins':
			return translate(
				'You are about to %(actionText)s %(numberOfPlugins)d plugins installed across %(numberOfSites)d sites.',
				{
					args: {
						actionText: actionText,
						numberOfPlugins: pluginsListSize,
						numberOfSites: siteListSize,
					},
				}
			);
	}
};

// Returns plugin action dailog message for different action types
export const getPluginActionDailogMessage = ( sites, selectedPlugins, heading, actionText ) => {
	return (
		<div>
			<div className="plugins__confirmation-modal-heading">{ heading }</div>
			<span className="plugins__confirmation-modal-desc">
				{ getConfirmationText( sites, selectedPlugins, actionText ) }
			</span>
		</div>
	);
};
