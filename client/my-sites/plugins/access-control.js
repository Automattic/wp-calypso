/**
 * Internal Dependencies
 */
var sites = require( 'lib/sites-list' )(),
	i18n = require( 'lib/mixins/i18n' ),
	config = require( 'config' ),
	analytics = require( 'analytics' ),
	isBusiness = require( 'lib/products-values' ).isBusiness,
	notices = require( 'notices' ),
	abtest = require( 'lib/abtest' ).abtest;

function hasErrorCondition( site, type ) {
	var errorConditions = {
		noBusinessPlan: site && ! site.jetpack && ! isBusiness( site.plan ),
		notMinimumJetpackVersion: site && ! site.hasMinimumJetpackVersion && site.jetpack,
		notRightsToManagePlugins: sites.initialized && ! sites.canManageSelectedOrAll()
	};
	return errorConditions[ type ];
}

function hasRestrictedAccess( site ) {
	var pluginPageError;

	site = site || sites.getSelectedSite();

	if ( hasErrorCondition( site, 'notMinimumJetpackVersion' ) ) {
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

	// Display a 404 to users that don't have the rights to manage plugins
	if ( hasErrorCondition( site, 'notRightsToManagePlugins' ) &&
			! pluginPageError ) {
		pluginPageError = {
			title: i18n.translate( 'Not Available' ),
			line: i18n.translate( 'The page you requested could not be found' ),
			illustration: '/calypso/images/drake/drake-404.svg',
			fullWidth: true
		};
	}

	if ( abtest( 'businessPluginsNudge' ) === 'drake' && hasErrorCondition( site, 'noBusinessPlan' ) ) {
		pluginPageError = {
			title: i18n.translate( 'Want to add a store to your site?' ),
			line: i18n.translate( 'Support for Shopify, Ecwid, and Gumroad is now available for WordPress.com Business.' ),
			action: i18n.translate( 'Upgrade Now' ),
			actionURL: '/plans/' + site.slug,
			illustration: '/calypso/images/drake/drake-whoops.svg',
			actionCallback: function() {
				analytics.tracks.recordEvent( 'calypso_upgrade_nudge_cta_click', { cta_name: 'business_plugins' } );
			}
		};
	}

	return pluginPageError;
}

module.exports = { hasRestrictedAccess: hasRestrictedAccess };
