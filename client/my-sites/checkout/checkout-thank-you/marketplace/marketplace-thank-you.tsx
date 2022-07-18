import { WPCOM_FEATURES_MANAGE_PLUGINS } from '@automattic/calypso-products';
import { ThemeProvider, Global, css } from '@emotion/react';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import successImage from 'calypso/assets/images/marketplace/check-circle.svg';
import { ThankYou } from 'calypso/components/thank-you';
import { useWPCOMPlugin } from 'calypso/data/marketplace/use-wpcom-plugins-query';
import { FullWidthButton } from 'calypso/my-sites/marketplace/components';
import MasterbarStyled from 'calypso/my-sites/marketplace/components/masterbar-styled';
import MarketplaceProgressBar from 'calypso/my-sites/marketplace/components/progressbar';
import useMarketplaceAdditionalSteps from 'calypso/my-sites/marketplace/pages/marketplace-plugin-install/use-marketplace-additional-steps';
import theme from 'calypso/my-sites/marketplace/theme';
import { waitFor } from 'calypso/my-sites/marketplace/util';
import { requestAdminMenu } from 'calypso/state/admin-menu/actions';
import { fetchAutomatedTransferStatus } from 'calypso/state/automated-transfer/actions';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import {
	getAutomatedTransferStatus,
	isFetchingAutomatedTransferStatus,
} from 'calypso/state/automated-transfer/selectors';
import { pluginInstallationStateChange } from 'calypso/state/marketplace/purchase-flow/actions';
import { MARKETPLACE_ASYNC_PROCESS_STATUS } from 'calypso/state/marketplace/types';
import { fetchSitePlugins } from 'calypso/state/plugins/installed/actions';
import { getPluginOnSite, isRequesting } from 'calypso/state/plugins/installed/selectors';
import { fetchPluginData as wporgFetchPluginData } from 'calypso/state/plugins/wporg/actions';
import { getPlugin, isFetched } from 'calypso/state/plugins/wporg/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { getSiteAdminUrl, isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';

const ThankYouContainer = styled.div`
	.marketplace-thank-you {
		margin-top: 72px;
		img {
			height: 74px;
		}
	}

	.thank-you__header-title {
		font-size: 44px;
	}

	.thank-you__header-subtitle {
		font-size: 16px;
		color: var( --studio-gray-60 );
	}
`;

const MarketplaceThankYou = ( { productSlug }: { productSlug: string } ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const isRequestingPlugins = useSelector( ( state ) => isRequesting( state, siteId ) );
	const pluginOnSite = useSelector( ( state ) => getPluginOnSite( state, siteId, productSlug ) );
	const wporgPlugin = useSelector( ( state ) => getPlugin( state, productSlug ) );
	const isWporgPluginFetched = useSelector( ( state ) => isFetched( state, productSlug ) );
	const siteAdminUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId ) );
	const isFetchingTransferStatus = useSelector( ( state ) =>
		isFetchingAutomatedTransferStatus( state, siteId )
	);
	const transferStatus = useSelector( ( state ) => getAutomatedTransferStatus( state, siteId ) );
	const hasManagePluginsFeature = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_MANAGE_PLUGINS )
	);
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, siteId ) );
	const isJetpackSelfHosted = isJetpack && ! isAtomic;

	const [ pluginIcon, setPluginIcon ] = useState( '' );
	const [ currentStep, setCurrentStep ] = useState( 1 );

	const isPluginOnSite = !! pluginOnSite;
	const hideProgressBar = new URLSearchParams( document.location.search ).has(
		'hide-progress-bar'
	);

	// Site is transferring to Atomic.
	// Poll the transfer status.
	useEffect( () => {
		if ( ! siteId || transferStatus === transferStates.COMPLETE || isJetpackSelfHosted ) {
			return;
		}
		if ( ! isFetchingTransferStatus ) {
			waitFor( 2 ).then( () => dispatch( fetchAutomatedTransferStatus( siteId ) ) );
		}
	}, [ siteId, dispatch, transferStatus, isFetchingTransferStatus, isJetpackSelfHosted ] );

	useEffect( () => {
		dispatch(
			pluginInstallationStateChange(
				MARKETPLACE_ASYNC_PROCESS_STATUS.COMPLETED,
				'deauthorize plugin installation URL'
			)
		);
	}, [ dispatch ] );

	// retrieve wporg plugin data if not available
	useEffect( () => {
		if ( ! isWporgPluginFetched ) {
			dispatch( wporgFetchPluginData( productSlug ) );
		}
		if ( isWporgPluginFetched ) {
			// wporgPlugin exists in the wporg directory.
			setPluginIcon( wporgPlugin?.icon || successImage );
		}
	}, [ isWporgPluginFetched, productSlug, setPluginIcon, dispatch, wporgPlugin?.icon ] );

	useEffect( () => {
		if ( wporgPlugin?.wporg === false ) {
			// wporgPlugin exists and plugin doesn't exist in wporg directory.
			setPluginIcon( successImage );
		}
	}, [ wporgPlugin ] );

	// retrieve WPCom plugin data
	const { data: wpComPluginData } = useWPCOMPlugin( productSlug );

	// Site is already Atomic (or just transferred).
	// Poll the plugin installation status.
	useEffect( () => {
		if ( ! siteId || ( isAtomic && transferStatus !== transferStates.COMPLETE ) ) {
			return;
		}

		// Update the menu after the plugin has been installed, since that might change some menu items.
		if ( isPluginOnSite ) {
			dispatch( requestAdminMenu( siteId ) );
			return;
		}

		if ( ! isRequestingPlugins ) {
			waitFor( 1 ).then( () => dispatch( fetchSitePlugins( siteId ) ) );
		}
	}, [ isRequestingPlugins, isPluginOnSite, dispatch, siteId, transferStatus, isAtomic ] );

	// Set progressbar (currentStep) depending on transfer status.
	// Step 0 hides the progress bar. It means "complete".
	// Steps 1-2 advance through the bar.
	useEffect( () => {
		if ( hideProgressBar ) {
			setCurrentStep( 0 );
			return;
		}

		if ( transferStatus !== transferStates.COMPLETE ) {
			setCurrentStep( 1 );
		} else if ( ! isPluginOnSite ) {
			setCurrentStep( 2 );
		} else {
			setCurrentStep( 0 );
		}
	}, [ transferStatus, isPluginOnSite, hideProgressBar ] );

	const steps = useMemo(
		() => [ translate( 'Installing plugin' ), translate( 'Activating plugin' ) ],
		[ translate ]
	);
	const additionalSteps = useMarketplaceAdditionalSteps();

	const thankYouImage = {
		alt: '',
		src: pluginIcon,
	};

	// Cast pluginOnSite's type because the return type of getPluginOnSite is
	// wrong and I don't know how to fix it. Remove this cast if the return type
	// can be made correct.
	const pluginOnSiteData = pluginOnSite as
		| undefined
		| { action_links?: { Settings?: string }; name?: string };

	const fallbackSetupUrl = wpComPluginData?.setup_url && siteAdminUrl + wpComPluginData?.setup_url;
	const managePluginsUrl = hasManagePluginsFeature
		? `${ siteAdminUrl }plugins.php`
		: `/plugins/${ productSlug }/${ siteSlug } `;

	const setupURL = pluginOnSiteData?.action_links?.Settings || fallbackSetupUrl || managePluginsUrl;

	const documentationURL = wpComPluginData?.documentation_url;

	const setupSection = {
		sectionKey: 'setup_whats_next',
		sectionTitle: translate( 'What’s next?' ),
		nextSteps: [
			{
				stepKey: 'whats_next_plugin_setup',
				stepTitle: translate( 'Plugin setup' ),
				stepDescription: translate(
					'Get to know your plugin and customize it, so you can hit the ground running.'
				),
				stepCta: (
					<FullWidthButton href={ setupURL } primary busy={ ! isPluginOnSite }>
						{ translate( 'Manage plugin' ) }
					</FullWidthButton>
				),
			},
			...( documentationURL
				? [
						{
							stepKey: 'whats_next_documentation',
							stepTitle: translate( 'Documentation' ),
							stepDescription: translate(
								'Visit the step-by-step guide to learn how to use this plugin.'
							),
							stepCta: (
								<FullWidthButton href={ documentationURL }>
									{ translate( 'Visit guide' ) }
								</FullWidthButton>
							),
						},
				  ]
				: [] ),
			{
				stepKey: 'whats_next_grow',
				stepTitle: translate( 'Keep growing' ),
				stepDescription: translate(
					'Take your site to the next level. We have all the solutions to help you grow and thrive.'
				),
				stepCta: (
					<FullWidthButton href={ `/plugins/${ siteSlug }` }>
						{ translate( 'Explore plugins' ) }
					</FullWidthButton>
				),
			},
		],
	};

	const thankYouSubtitle = translate( '%(pluginName)s has been installed.', {
		args: { pluginName: pluginOnSiteData?.name },
	} );

	return (
		<ThemeProvider theme={ theme }>
			{ /* Using Global to override Global masterbar height */ }
			<Global
				styles={ css`
					body.is-section-marketplace {
						--masterbar-height: 72px;
					}
				` }
			/>
			<MasterbarStyled
				onClick={ () => page( `/plugins/${ siteSlug }` ) }
				backText={ translate( 'Back to plugins' ) }
				canGoBack={ currentStep === 0 }
			/>
			{ currentStep > 0 && (
				// eslint-disable-next-line wpcalypso/jsx-classname-namespace
				<div className="marketplace-plugin-install__root">
					<MarketplaceProgressBar
						steps={ steps }
						currentStep={ currentStep - 1 }
						additionalSteps={ additionalSteps }
					/>
				</div>
			) }
			<ThankYouContainer>
				<ThankYou
					containerClassName="marketplace-thank-you"
					sections={ [ setupSection ] }
					showSupportSection={ true }
					thankYouImage={ thankYouImage }
					thankYouTitle={ translate( 'All ready to go!' ) }
					thankYouSubtitle={ isPluginOnSite ? thankYouSubtitle : '' }
					headerBackgroundColor="#fff"
					headerTextColor="#000"
				/>
			</ThankYouContainer>
		</ThemeProvider>
	);
};

export default MarketplaceThankYou;
