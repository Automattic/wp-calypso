/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { ThemeProvider } from 'emotion-theming';
import { useSelector, useDispatch } from 'react-redux';
import page from 'page';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import theme from 'calypso/my-sites/plugins/marketplace/theme';
import Masterbar from 'calypso/layout/masterbar/masterbar';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import { initiateThemeTransfer } from 'calypso/state/themes/actions';
import { getPurchaseFlowState } from 'calypso/state/plugins/marketplace/selectors';
import { fetchAutomatedTransferStatus } from 'calypso/state/automated-transfer/actions';
import { getAutomatedTransferStatus } from 'calypso/state/automated-transfer/selectors';
import SimulatedProgressBar from 'calypso/my-sites/plugins/marketplace/components/simulated-progressbar';

/**
 * Style dependencies
 */
import 'calypso/my-sites/plugins/marketplace/marketplace-plugin-setup-status/style.scss';

/**
 * This component simulates progress for the purchase flow. It also does any async tasks required in the purchase flow. This includes installing any plugins required.
 * TODO: Refactor component so that it can easily handle multiple speeds of simulated progress
 */

function WrappedMarketplacePluginSetup(): JSX.Element {
	const translate = useTranslate();
	const dispatch = useDispatch();
	const selectedSiteId = useSelector( getSelectedSiteId );
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const transferStatus = useSelector( ( state ) =>
		getAutomatedTransferStatus( state, selectedSiteId )
	);
	const { pluginSlugToBeInstalled, isPluginInstalledDuringPurchase } = useSelector(
		getPurchaseFlowState
	);

	useEffect( () => {
		dispatch( fetchAutomatedTransferStatus( selectedSiteId ?? 0 ) );
	}, [ fetchAutomatedTransferStatus ] );

	useEffect( () => {
		if ( pluginSlugToBeInstalled && selectedSiteId ) {
			dispatch( initiateThemeTransfer( selectedSiteId, null, pluginSlugToBeInstalled ) );
		} else if ( ! isPluginInstalledDuringPurchase ) {
			// Invalid State redirect to Yoast marketplace page for now, and maybe a marketplace home view in the future
			page(
				`/marketplace/product/details/wordpress-seo/${ selectedSiteSlug }?flags=marketplace-yoast`
			);
		}
	}, [ dispatch, pluginSlugToBeInstalled, isPluginInstalledDuringPurchase, selectedSiteId ] );

	useEffect( () => {
		if ( transferStatus === 'complete' ) {
			page( `/marketplace/thank-you/${ selectedSiteId }?flags=marketplace-yoast` );
		}
	}, [ selectedSiteId, selectedSiteSlug, transferStatus ] );

	const STEP_1 = translate( 'Installing plugin' );
	const STEP_2 = translate( 'Activating plugin' );
	const steps = [ STEP_1, STEP_2 ];
	return (
		<>
			{ selectedSiteId ? <QueryJetpackPlugins siteIds={ [ selectedSiteId ] } /> : '' }
			<Masterbar></Masterbar>
			<div className="marketplace-plugin-setup-status__root">
				<div>
					<SimulatedProgressBar steps={ steps } />
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
