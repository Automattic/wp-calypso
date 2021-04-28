/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';

/**
 * Internal dependencies
 */
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import { isJetpackSite, getSiteWoocommerceWizardUrl } from 'calypso/state/sites/selectors';
import { isPluginActionCompleted } from 'calypso/state/plugins/installed/selectors';
import { INSTALL_PLUGIN } from 'calypso/lib/plugins/constants';
import getSiteConnectionStatus from 'calypso/state/selectors/get-site-connection-status';
import { getAutomatedTransferStatus } from 'calypso/state/automated-transfer/selectors';
import { transferStates } from 'calypso/state/automated-transfer/constants';

const withPluginRedirect = ( Component ) => ( props ) => {
	const { pluginSlug } = props;
	if ( ! pluginSlug ) {
		return <Component { ...props } />;
	}

	const redirectUrl = useSelector(
		( state ) => {
			const site = getSelectedSite( state );
			const isAtomic = isSiteAutomatedTransfer( state, site.ID );
			const isJetpack = isJetpackSite( state, site.ID );
			const woocommerceWizardUrl = getSiteWoocommerceWizardUrl( state, site.ID );
			const transferState = getAutomatedTransferStatus( state, site.ID );
			const hasPluginJustBeenInstalled = isPluginActionCompleted(
				state,
				site.ID,
				pluginSlug,
				INSTALL_PLUGIN
			);

			const isSiteConnected = getSiteConnectionStatus( state, site.ID );

			// Jetpack site.
			if (
				isJetpack &&
				pluginSlug === 'woocommerce' &&
				woocommerceWizardUrl &&
				hasPluginJustBeenInstalled &&
				isSiteConnected
			) {
				return woocommerceWizardUrl;
			}

			// Atomic Site.
			if (
				isAtomic &&
				pluginSlug === 'woocommerce' &&
				woocommerceWizardUrl &&
				transferState === transferStates?.COMPLETE &&
				isSiteConnected
			) {
				return woocommerceWizardUrl;
			}
		},
		[ pluginSlug ]
	);

	useEffect( () => {
		if ( ! redirectUrl ) {
			return;
		}

		window.location.href = redirectUrl;
	}, [ redirectUrl ] );

	return <Component { ...props } />;
};

export default withPluginRedirect;
