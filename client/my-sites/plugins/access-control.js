/**
 * External Dependencies
 */
import React from 'react'

/**
 * Internal Dependencies
 */
import PluginItem from 'my-sites/plugins/plugin-item/plugin-item'
import sitesList from 'lib/sites-list'
import i18n from 'lib/mixins/i18n'
import config from 'config'
import analytics from 'analytics'
import { isBusiness } from 'lib/products-values'
import notices from 'notices'
import { abtest } from 'lib/abtest'

let sites = sitesList();

const hasErrorCondition = ( site, type ) => {
	const errorConditions = {
		noBusinessPlan: site && ! site.jetpack && ! isBusiness( site.plan ),
		notMinimumJetpackVersion: site && ! site.hasMinimumJetpackVersion && site.jetpack,
		notRightsToManagePlugins: sites.initialized && ! sites.canManageSelectedOrAll()
	};
	return errorConditions[ type ];
}

const getMockBusinessPluginItems = () => {
	const plugins = [ {
		slug: 'ecwid',
		name: 'Ecwid',
		wpcom: true,
		icon: '/calypso/images/upgrades/plugins/ecwid.png'
	}, {
		slug: 'gumroad',
		name: 'Gumroad',
		wpcom: true,
		icon: '/calypso/images/upgrades/plugins/gumroad.png'
	}, {
		slug: 'shopify',
		name: 'Shopify',
		wpcom: true,
		icon: '/calypso/images/upgrades/plugins/shopify-store.png'
	} ];
	const selectedSite = {
		slug: 'no-slug',
		canUpdateFiles: true,
		name: 'Not a real site'
	}

	return plugins.map( plugin => {
		return React.createElement( PluginItem, {
			key: 'plugin-item-mock-' + plugin.slug,
			plugin: plugin,
			sites: [],
			selectedSite: selectedSite,
			progress: [],
			isMock: true }
		);
	} );
}

const hasRestrictedAccess = ( site ) => {
	let pluginPageError;

	site = site || sites.getSelectedSite();

	// Display a 404 to users that don't have the rights to manage plugins
	if ( hasErrorCondition( site, 'notRightsToManagePlugins' ) ) {
		pluginPageError = {
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

	if ( abtest( 'businessPluginsNudge' ) === 'drake' && hasErrorCondition( site, 'noBusinessPlan' ) ) {
		pluginPageError = {
			title: i18n.translate( 'Want to add a store to your site?' ),
			line: i18n.translate( 'Support for Shopify, Ecwid, and Gumroad is now available for WordPress.com Business.' ),
			action: i18n.translate( 'Upgrade Now' ),
			actionURL: '/plans/' + site.slug,
			illustration: '/calypso/images/drake/drake-whoops.svg',
			actionCallback: () => {
				analytics.tracks.recordEvent( 'calypso_upgrade_nudge_cta_click', { cta_name: 'business_plugins' } );
			},
			featureExample: getMockBusinessPluginItems()
		};
	}

	return pluginPageError;
}

export default { hasRestrictedAccess };
