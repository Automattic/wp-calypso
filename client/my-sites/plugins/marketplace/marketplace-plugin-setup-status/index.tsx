/**
 * External dependencies
 */
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import Masterbar from 'calypso/layout/masterbar/masterbar';

/**
 * Internal dependencies
 */
import theme from 'calypso/my-sites/plugins/marketplace/theme';
import { getAutomatedTransferStatus } from 'calypso/state/automated-transfer/selectors';
import { initiatePluginInstall } from 'calypso/state/plugins/marketplace/actions';
import { getPurchaseFlowState } from 'calypso/state/plugins/marketplace/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { ThemeProvider } from 'emotion-theming';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SimulatedProgressbar from 'calypso/my-sites/plugins/marketplace/components/simulated-progressbar';
// import getPrimaryDomainBySiteId from 'calypso/state/selectors/get-primary-domain-by-site-id';

/**
 *
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
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const selectedSiteId = useSelector( getSelectedSiteId );
	// const primaryDomain = useSelector( ( state ) =>
	// 	getPrimaryDomainBySiteId( state, selectedSiteId ?? 0 )
	// );

	const transferStatus = useSelector( ( state ) =>
		getAutomatedTransferStatus( state, selectedSiteId )
	);

	const { isPluginInstalledDuringPurchase } = useSelector( getPurchaseFlowState );

	useEffect( () => {
		if ( ! isPluginInstalledDuringPurchase ) {
			// Invalid State redirect to Yoast marketplace page for now, and maybe a marketplace home view in the future
			page(
				`/marketplace/product/details/wordpress-seo/${ selectedSiteSlug }?flags=marketplace-yoast`
			);
		} else {
			selectedSiteId && dispatch( initiatePluginInstall( selectedSiteId ) );
		}
	}, [ dispatch, isPluginInstalledDuringPurchase, selectedSiteId, selectedSiteSlug ] );

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
					<SimulatedProgressbar steps={ steps } />
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
