/** @format */
/**
 * External dependencies
 */
import { find } from 'lodash';
/**
 * Internal dependencies
 */
import config from 'config';
import { getSelectedSiteWithFallback } from '../sites/selectors';
import { getPlugins, isRequestingForSites } from 'state/plugins/installed/selectors';

export const isWcsEnabled = ( state, siteId = getSelectedSiteWithFallback( state ) ) => {
	if ( ! config.isEnabled( 'woocommerce/extension-wcservices' ) ) {
		return false;
	}

	const siteIds = [ siteId ];

	if ( isRequestingForSites( state, siteIds ) ) {
		return false;
	}

	const plugins = getPlugins( state, siteIds, 'active' );
	return Boolean( find( plugins, { slug: 'woocommerce-services' } ) );
};
