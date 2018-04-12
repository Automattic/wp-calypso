/** @format */
/**
 * External dependencies
 */
import { every, find } from 'lodash';
/**
 * Internal dependencies
 */
import config from 'config';
import { getPlugins, isRequestingForSites } from 'state/plugins/installed/selectors';
import { getRequiredPluginsForCalypso } from 'woocommerce/lib/get-required-plugins';
import { getSelectedSiteWithFallback } from '../sites/selectors';

export const isWcsEnabled = ( state, siteId = getSelectedSiteWithFallback( state ) ) => {
	if ( ! config.isEnabled( 'woocommerce/extension-wcservices' ) ) {
		return false;
	}

	const siteIds = [ siteId ];

	if ( isRequestingForSites( state, siteIds ) ) {
		return null;
	}

	const plugins = getPlugins( state, siteIds, 'active' );
	return Boolean( find( plugins, { slug: 'woocommerce-services' } ) );
};

export const areAllRequiredPluginsActive = (
	state,
	siteId = getSelectedSiteWithFallback( state )
) => {
	const siteIds = [ siteId ];

	if ( isRequestingForSites( state, siteIds ) ) {
		return null;
	}

	const requiredPlugins = getRequiredPluginsForCalypso();
	const plugins = getPlugins( state, siteIds, 'active' );

	return every( requiredPlugins, slug => !! find( plugins, { slug } ) );
};
