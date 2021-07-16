/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import { ThemeProvider } from 'emotion-theming';
import { useSelector, useDispatch } from 'react-redux';
import page from 'page';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import theme from 'calypso/my-sites/marketplace/theme';
import Masterbar from 'calypso/layout/masterbar/masterbar';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import {
	getPurchaseFlowState,
	getIsProductSetupComplete,
	getHasProductSetupError,
} from 'calypso/state/marketplace/purchase-flow/selectors';
import SimulatedProgressBar from 'calypso/my-sites/marketplace/components/simulated-progressbar';
import { getAutomatedTransfer } from 'calypso/state/automated-transfer/selectors';
import { tryProductInstall } from 'calypso/state/marketplace/purchase-flow/actions';
import {
	navigateToInstallationThankYouPage,
	navigateToProductGroupHomePage,
	waitFor,
} from 'calypso/my-sites/marketplace/util';
import {
	isLoaded,
	isRequestingForSites,
	getStatusForPlugin,
} from 'calypso/state/plugins/installed/selectors';
import {
	isFetching as getIsWporgPluginFetching,
	isFetched as getIsWporgPluginFetched,
	getPlugin as getWporgPlugin,
} from 'calypso/state/plugins/wporg/selectors';
import { marketplaceDebugger } from 'calypso/my-sites/marketplace/constants';

/**
 * Style dependencies
 */
import './style.scss';
import { getPluginsToInstall } from 'calypso/my-sites/marketplace/marketplace-product-definitions';

/**
 * This page busy waits and installs any plugins that are required in the marketplace purchase flow.
 */
function WrappedMarketplacePluginSetup(): JSX.Element {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const [ installedPluginSlug, setInstalledPluginSlug ] = useState< string >();
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const selectedSiteId = useSelector( getSelectedSiteId );
	const {
		fetchingStatus: automatedTransferFetchingStatus,
		status: automatedTransferStatus,
	} = useSelector( ( state ) => getAutomatedTransfer( state, selectedSiteId ) );

	const {
		productSlugInstalled,
		productGroupSlug,
		siteTransferStatus,
		pluginInstallationStatus,
	} = useSelector( getPurchaseFlowState );
	const hasProductSetupError = useSelector( getHasProductSetupError );
	const isProductSetupComplete = useSelector( getIsProductSetupComplete );

	const pluginStatus = useSelector( ( state ) =>
		getStatusForPlugin( state, selectedSiteId, installedPluginSlug )
	);
	const isPluginStateLoaded = useSelector( ( state ) => isLoaded( state, [ selectedSiteId ] ) );
	const isPluginStateFetching = useSelector( ( state ) =>
		isRequestingForSites( state, [ selectedSiteId ] )
	);

	// WPorg Plugin Data
	const isWporgPluginFetching = useSelector( ( state ) =>
		getIsWporgPluginFetching( state, installedPluginSlug )
	);
	const isWporgPluginFetched = useSelector( ( state ) =>
		getIsWporgPluginFetched( state, installedPluginSlug )
	);
	const wporgPlugin = useSelector( ( state ) => getWporgPlugin( state, installedPluginSlug ) );
	useEffect( () => {
		if ( ! selectedSiteSlug ) {
			page( '/home' );
		} else if ( ! productSlugInstalled || ! productGroupSlug ) {
			// A plugin slug should have been provided to reach this page
			marketplaceDebugger(
				'::MARKETPLACE::ERROR:: There is an error in plugin setup page, productSlugInstalled or productGroupSlug is not provided'
			);
			page( `/home/${ selectedSiteSlug }` );
		} else {
			const plugins = getPluginsToInstall( productGroupSlug, productSlugInstalled );
			if ( ! Array.isArray( plugins ) || plugins.length === 0 ) {
				marketplaceDebugger(
					'::MARKETPLACE::ERROR:: There is an error in plugin setup page, plugins to install are not available'
				);
				page( `/home/${ selectedSiteSlug }` );
			} else {
				// TODO: handle installation of multiple plugins
				setInstalledPluginSlug( plugins[ 0 ] );
			}
		}
	}, [ dispatch, installedPluginSlug, productGroupSlug, productSlugInstalled, selectedSiteSlug ] );

	useEffect( () => {
		if ( hasProductSetupError ) {
			marketplaceDebugger( '::MARKETPLACE::ERROR:: There is an error in product setup' );
			selectedSiteSlug &&
				productGroupSlug &&
				navigateToProductGroupHomePage( selectedSiteSlug, productGroupSlug );
		} else if ( isProductSetupComplete ) {
			/**
			 * Wait for simulated progressbar to catchup
			 */
			waitFor( 5 ).then(
				() => selectedSiteSlug && navigateToInstallationThankYouPage( selectedSiteSlug )
			);
		} else {
			// For each effect call, try to install the plugin
			dispatch( tryProductInstall() );
		}
	}, [
		dispatch,
		selectedSiteSlug,
		pluginInstallationStatus,
		siteTransferStatus,
		hasProductSetupError,
		isProductSetupComplete,
		installedPluginSlug,
		productGroupSlug,
		/**
		 * Additional subscribed states to run tryProductInstall
		 */
		pluginStatus,
		automatedTransferFetchingStatus,
		automatedTransferStatus,
		isPluginStateLoaded,
		isPluginStateFetching,
		isWporgPluginFetching,
		isWporgPluginFetched,
		wporgPlugin,
	] );

	const STEP_1 = translate( 'Installing plugin' );
	const STEP_2 = translate( 'Activating plugin' );
	const steps = [ STEP_1, STEP_2 ];
	return (
		<>
			{ selectedSiteId ? <QueryJetpackPlugins siteIds={ [ selectedSiteId ] } /> : '' }
			<Masterbar></Masterbar>
			<div className="marketplace-plugin-setup-status__root">
				<div>
					<SimulatedProgressBar steps={ steps } accelerateCompletion={ isProductSetupComplete } />
				</div>
			</div>
		</>
	);
}

export default function MarketplacePluginSetup(): JSX.Element {
	return (
		<ThemeProvider theme={ theme }>
			<WrappedMarketplacePluginSetup />
		</ThemeProvider>
	);
}
