/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import { ThemeProvider } from 'emotion-theming';
import { ProgressBar } from '@automattic/components';
import styled from '@emotion/styled';
import { useSelector, useDispatch } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import theme from 'calypso/my-sites/plugins/marketplace/theme';
import Masterbar from 'calypso/layout/masterbar/masterbar';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import { initiateThemeTransfer } from 'calypso/state/themes/actions';
import { getAutomatedTransferStatus } from 'calypso/state/automated-transfer/selectors';
/**
 * Style dependencies
 */
import 'calypso/my-sites/plugins/marketplace/marketplace-plugin-setup-status/style.scss';
import { getPurchaseFlowState } from 'calypso/state/plugins/marketplace/selectors';

const StyledProgressBar = styled( ProgressBar )`
	margin: 20px 0px;
`;

function WrappedMarketplacePluginSetup(): JSX.Element {
	const [ currentStage, setCurrentStage ] = useState( 1 );
	const [ simulatedProgressPercentage, setSimulatedProgressPercentage ] = useState( 0 );
	const stages = [ 'Installing plugin', 'Activating plugin' ];
	const interval = 2000;

	const dispatch = useDispatch();
	const selectedSite = useSelector( getSelectedSite );
	const transferStatus = useSelector( ( state ) =>
		getAutomatedTransferStatus( state, selectedSite?.ID )
	);
	const { pluginSlugToBeInstalled, isPluginInstalledDuringPurchase } = useSelector(
		getPurchaseFlowState
	);

	useEffect( () => {
		if ( pluginSlugToBeInstalled ) {
			dispatch( initiateThemeTransfer( selectedSite.ID, null, pluginSlugToBeInstalled ) );
		} else if ( isPluginInstalledDuringPurchase ) {
			alert( 'To be implemented: polling wait to be implemented to check for transfer' );
		} else {
			//Invalid State redirect to Yoast marketplace page for now, and maybe a marketplace home view in the future
			page(
				`/plugins/marketplace/product/details/wordpress-seo${
					selectedSite?.slug ? `/${ selectedSite.slug }` : ''
				}`
			);
		}
	}, [ dispatch, pluginSlugToBeInstalled ] );

	useEffect( () => {
		setTimeout(
			() => {
				if ( simulatedProgressPercentage < 95 ) {
					setSimulatedProgressPercentage( ( percentage ) => percentage + 6 );
				} else if ( simulatedProgressPercentage !== 100 && simulatedProgressPercentage !== 95 ) {
					setSimulatedProgressPercentage( 95 );
				}
			},

			interval
		);
	}, [ simulatedProgressPercentage ] );

	useEffect( () => {
		if ( transferStatus === 'complete' ) {
			//TODO: Make sure the primary domain is set to the relevant domain
			setSimulatedProgressPercentage( 100 );
			setTimeout( () => {
				page(
					`/plugins/marketplace/thank-you${ selectedSite?.slug ? `/${ selectedSite.slug }` : '' }`
				);
			}, 4000 );
		}
	}, [ selectedSite.slug, transferStatus ] );

	if ( simulatedProgressPercentage > 50 && currentStage === 1 ) {
		setCurrentStage( 2 );
	}
	return (
		<>
			{ selectedSite?.ID ? <QueryJetpackPlugins siteIds={ [ selectedSite.ID ] } /> : '' }
			<Masterbar></Masterbar>
			<div className="marketplace-plugin-setup-status__root">
				<div>
					<h1 className="marketplace-plugin-setup-status__title wp-brand-font">
						{ <div>{ stages[ currentStage - 1 ] }</div> }
					</h1>
					<StyledProgressBar value={ simulatedProgressPercentage } color="#C9356E" compact />
					{
						<div>
							Step { currentStage } of { stages.length }
						</div>
					}
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
