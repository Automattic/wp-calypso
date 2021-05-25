/**
 * Internal dependencies
 */
import {
	getSiteWooCommerceWizardUrl,
	getSiteWordPressSeoWizardUrl,
} from 'calypso/state/sites/selectors';

/*
 * Plugins list that, once installed in the site,
 * should make the app perform a redirect to
 * specific page, for instance, an onboarding one.
 */
export const redirectingPluginsList = {
	woocommerce: {
		name: 'WooCommerce',
		getUrl: getSiteWooCommerceWizardUrl,
	},

	'wordpress-seo': {
		name: 'Yoast',
		getUrl: getSiteWordPressSeoWizardUrl,
	},
};

/**
 * Helper function that
 * return the plugin redirect object.
 *
 * @param {string} slug - plugin  slug
 * @returns {object} Redirect plugin object for the plugin, or False.
 */
export function getRedirectPluginHandler( slug ) {
	return redirectingPluginsList[ slug ] ?? false;
}
