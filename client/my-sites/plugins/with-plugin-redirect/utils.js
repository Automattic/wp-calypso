/**
 * WordPress dependencies
 */
import { translate } from 'i18n-calypso';

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
		message: translate( 'Redirecting to setup WooCommerce in five seconds.' ),
		getUrl: getSiteWooCommerceWizardUrl,
	},

	'wordpress-seo': {
		name: 'WooCommerce',
		message: translate( 'Redirecting to setup Yoast in five seconds.' ),
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
	if ( ! redirectingPluginsList.hasOwnProperty( slug ) ) {
		return false;
	}

	return redirectingPluginsList[ slug ];
}
