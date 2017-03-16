/**
 * External Dependencies
 */
import i18n from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import sitesList from 'lib/sites-list';
import config from 'config';
import notices from 'notices';

const sites = sitesList();

const hasErrorCondition = ( site, type ) => {
	const errorConditions = {
		notMinimumJetpackVersion: site && ! site.hasMinimumJetpackVersion && site.jetpack,
		notRightsToManagePlugins: sites.initialized && ! sites.canManageSelectedOrAll()
	};
	return errorConditions[ type ];
};

const getWpcomPluginPageError = () => {
	return {
		title: i18n.translate( 'Oops! Not supported' ),
		line: i18n.translate( 'This site doesn\'t support installing plugins. Switch to a self-hosted site to install and manage plugins' ),
		illustration: '/calypso/images/drake/drake-whoops.svg'
	};
};

const hasRestrictedAccess = ( site ) => {
	site = site || sites.getSelectedSite();

	// Display a 404 to users that don't have the rights to manage plugins
	if ( hasErrorCondition( site, 'notRightsToManagePlugins' ) ) {
		return {
			title: i18n.translate( 'Not Available' ),
			line: i18n.translate( 'The page you requested could not be found' ),
			illustration: '/calypso/images/drake/drake-404.svg',
			fullWidth: true
		};
	} else if ( hasErrorCondition( site, 'notMinimumJetpackVersion' ) ) {
		notices.warning(
			i18n.translate( 'Jetpack %(version)s is required to take full advantage of plugin management in %(site)s.', {
				args: {
					version: config( 'jetpack_min_version' ),
					site: site.domain
				}
			} ),
			{
				button: i18n.translate( 'Update now' ),
				href: site.options.admin_url + 'plugins.php?plugin_status=upgrade',
				dismissID: 'allSitesNotOnMinJetpackVersion' + config( 'jetpack_min_version' ) + '-' + site.ID
			}
		);
	}

	if ( ! sites.hasSiteWithPlugins() ) {
		return getWpcomPluginPageError();
	}
};

export default { hasRestrictedAccess };
