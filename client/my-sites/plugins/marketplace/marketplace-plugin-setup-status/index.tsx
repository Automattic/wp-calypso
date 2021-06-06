/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import { ThemeProvider } from 'emotion-theming';
import { ProgressBar } from '@automattic/components';
import styled from '@emotion/styled';
import { useSelector, useDispatch } from 'react-redux';
import page from 'page';
import { useTranslate } from 'i18n-calypso';

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

// Stages

function WrappedMarketplacePluginSetup(): JSX.Element {
	const translate = useTranslate();

	const STAGE_1 = translate( 'Installing plugin' );
	const STAGE_2 = translate( 'Activating plugin' );
	const stages = [ STAGE_1, STAGE_2 ];

	const [ currentStage, setCurrentStage ] = useState( STAGE_1 );
	const [ simulatedProgressPercentage, setSimulatedProgressPercentage ] = useState( 0 );

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
			// Invalid State redirect to Yoast marketplace page for now, and maybe a marketplace home view in the future
			page(
				`/marketplace/product/details/wordpress-seo${
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
			// TODO: Make sure the primary domain is set to the relevant domain before redireting to thank-you page
			setSimulatedProgressPercentage( 100 );
			setTimeout( () => {
				page(
					`/marketplace/thank-you${
						selectedSite?.slug ? `/${ selectedSite.slug }` : ''
					}?flags=marketplace-yoast`
				);
			}, 4000 );
		}
	}, [ selectedSite.slug, transferStatus ] );

	if ( simulatedProgressPercentage > 50 && currentStage === STAGE_1 ) {
		setCurrentStage( STAGE_2 );
	}

	const currentNumericStage = stages.indexOf( currentStage ) + 1;
	const stageIndication = translate( 'Step %(currentStage)s of %(stageCount)s', {
		args: { currentStage: currentNumericStage, stageCount: stages.length },
	} );

	return (
		<>
			{ selectedSite?.ID ? <QueryJetpackPlugins siteIds={ [ selectedSite.ID ] } /> : '' }
			<Masterbar></Masterbar>
			<div className="marketplace-plugin-setup-status__root">
				<div>
					<h1 className="marketplace-plugin-setup-status__title wp-brand-font">
						{ <div>{ currentStage }</div> }
					</h1>
					<StyledProgressBar value={ simulatedProgressPercentage } color="#C9356E" compact />
					<div>{ stageIndication }</div>
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
