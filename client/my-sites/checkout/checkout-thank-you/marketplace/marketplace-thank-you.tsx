import { WPCOM_FEATURES_MANAGE_PLUGINS } from '@automattic/calypso-products';
import { ThemeProvider, Global, css } from '@emotion/react';
import styled from '@emotion/styled';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import successImage from 'calypso/assets/images/marketplace/check-circle.svg';
import { ThankYou } from 'calypso/components/thank-you';
import { useWPCOMPlugins } from 'calypso/data/marketplace/use-wpcom-plugins-query';
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
import { getPluginsOnSite, isRequesting } from 'calypso/state/plugins/installed/selectors';
import { fetchPluginData as wporgFetchPluginData } from 'calypso/state/plugins/wporg/actions';
import { areFetched, getPlugins } from 'calypso/state/plugins/wporg/selectors';
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

type Plugin = {
	slug: string;
	fetched: boolean;
	wporg: boolean;
	icon: string;
};

const MarketplaceThankYou = ( { productSlug }: { productSlug: string } ) => {
	const [ productSlugs ] = useState< Array< string > >( productSlug.split( ',' ) );
	const dispatch = useDispatch();
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const isRequestingPlugins = useSelector( ( state ) => isRequesting( state, siteId ) );

	// retrieve WPCom plugin data
	const wpComPluginsDataResults = useWPCOMPlugins( productSlugs );
	const wpComPluginsData = wpComPluginsDataResults.map(
		( wpComPluginData ) => wpComPluginData.data
	);
	const softwareSlugs = wpComPluginsData.map( ( wpComPluginData, i ) =>
		wpComPluginData ? wpComPluginData.software_slug || wpComPluginData.org_slug : productSlugs[ i ]
	);

	const pluginsOnSite: [] = useSelector( ( state ) =>
		getPluginsOnSite( state, siteId, softwareSlugs )
	);
	const wporgPlugins = useSelector(
		( state ) => getPlugins( state, productSlugs ),
		( newPluginsValue: Array< Plugin >, oldPluginsValue: Array< Plugin > ) =>
			oldPluginsValue.length === newPluginsValue.length &&
			oldPluginsValue.every( ( oldPluginValue, i ) => {
				return (
					oldPluginValue?.slug === newPluginsValue[ i ]?.slug &&
					Boolean( oldPluginValue ) === Boolean( newPluginsValue[ i ] )
				);
			} )
	);
	const areWporgPluginsFetched = useSelector( ( state ) => areFetched( state, productSlugs ) );
	const areAllWporgPluginsFetched = areWporgPluginsFetched.every( Boolean );
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
	const [ currentStep, setCurrentStep ] = useState( 0 );
	const [ showProgressBar, setShowProgressBar ] = useState(
		! new URLSearchParams( document.location.search ).has( 'hide-progress-bar' )
	);

	const areAllPluginsOnSite =
		!! pluginsOnSite.length && pluginsOnSite.every( ( pluginOnSite ) => !! pluginOnSite );

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
		if ( ! areAllWporgPluginsFetched ) {
			productSlugs.forEach( ( productSlug ) => dispatch( wporgFetchPluginData( productSlug ) ) );
		}
		if ( areAllWporgPluginsFetched ) {
			// wporgPlugin exists in the wporg directory.
			setPluginIcon( wporgPlugins?.[ 0 ]?.icon || successImage );
		}
	}, [ areAllWporgPluginsFetched, productSlugs, dispatch, wporgPlugins ] );

	useEffect( () => {
		if ( wporgPlugins?.[ 0 ]?.wporg === false ) {
			// wporgPlugin exists and plugin doesn't exist in wporg directory.
			setPluginIcon( successImage );
		}
	}, [ wporgPlugins ] );

	// Site is already Atomic (or just transferred).
	// Poll the plugin installation status.
	useEffect( () => {
		if ( ! siteId || ( ! isJetpackSelfHosted && transferStatus !== transferStates.COMPLETE ) ) {
			return;
		}

		// Update the menu after the plugin has been installed, since that might change some menu items.
		if ( areAllPluginsOnSite ) {
			dispatch( requestAdminMenu( siteId ) );
			return;
		}

		if ( ! isRequestingPlugins ) {
			waitFor( 1 ).then( () => dispatch( fetchSitePlugins( siteId ) ) );
		}
	}, [
		isRequestingPlugins,
		areAllPluginsOnSite,
		dispatch,
		siteId,
		transferStatus,
		isJetpackSelfHosted,
	] );

	// Set progressbar (currentStep) depending on transfer/plugin status.
	useEffect( () => {
		// We don't want to show the progress bar again when it is hidden.
		if ( ! showProgressBar ) {
			return;
		}

		setShowProgressBar( ! areAllPluginsOnSite );

		// Sites already transferred to Atomic or self-hosted Jetpack sites no longer need to change the current step.
		if ( isJetpack ) {
			return;
		}

		if ( transferStatus === transferStates.ACTIVE ) {
			setCurrentStep( 0 );
		} else if ( transferStatus === transferStates.PROVISIONED ) {
			setCurrentStep( 1 );
		} else if ( transferStatus === transferStates.RELOCATING ) {
			setCurrentStep( 2 );
		} else if ( transferStatus === transferStates.COMPLETE ) {
			setCurrentStep( 3 );
		}
	}, [ transferStatus, areAllPluginsOnSite, showProgressBar, isJetpack ] );

	const steps = useMemo(
		() =>
			isJetpack
				? [ translate( 'Installing plugin' ) ]
				: [
						translate( 'Activating the plugin feature' ), // Transferring to Atomic
						translate( 'Setting up plugin installation' ), // Transferring to Atomic
						translate( 'Installing plugin' ), // Transferring to Atomic
						translate( 'Activating plugin' ),
				  ],
		// We intentionally don't set `isJetpack` as dependency to keep the same steps after the Atomic transfer.
		// eslint-disable-next-line react-hooks/exhaustive-deps
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
	const pluginsOnSiteData = pluginsOnSite as Array<
		undefined | { action_links?: { Settings?: string }; name?: string }
	>;

	const fallbackSetupUrls = wpComPluginsData.map(
		( wpComPluginData ) => wpComPluginData?.setup_url && siteAdminUrl + wpComPluginData?.setup_url
	);
	const managePluginsUrls = productSlugs.map( ( productSlug ) =>
		hasManagePluginsFeature
			? `${ siteAdminUrl }plugins.php`
			: `/plugins/${ productSlug }/${ siteSlug } `
	);

	const setupURLs = pluginsOnSiteData.map(
		( pluginOnSiteData, i ) =>
			pluginOnSiteData?.action_links?.Settings || fallbackSetupUrls[ i ] || managePluginsUrls[ i ]
	);

	const documentationURLs = wpComPluginsData.map(
		( wpComPluginData ) => wpComPluginData?.documentation_url
	);

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
					<FullWidthButton href={ setupURLs[ 0 ] } primary busy={ ! areAllPluginsOnSite }>
						{ translate( 'Manage plugin' ) }
					</FullWidthButton>
				),
			},
			...( documentationURLs[ 0 ]
				? [
						{
							stepKey: 'whats_next_documentation',
							stepTitle: translate( 'Documentation' ),
							stepDescription: translate(
								'Visit the step-by-step guide to learn how to use this plugin.'
							),
							stepCta: (
								<FullWidthButton href={ documentationURLs[ 0 ] }>
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
		args: { pluginName: pluginsOnSiteData?.[ 0 ]?.name },
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
				canGoBack={ areAllPluginsOnSite }
			/>
			{ showProgressBar && (
				// eslint-disable-next-line wpcalypso/jsx-classname-namespace
				<div className="marketplace-plugin-install__root">
					<MarketplaceProgressBar
						steps={ steps }
						currentStep={ currentStep }
						additionalSteps={ additionalSteps }
					/>
				</div>
			) }
			{ ! showProgressBar && (
				<ThankYouContainer>
					<ThankYou
						containerClassName="marketplace-thank-you"
						sections={ [ setupSection ] }
						showSupportSection={ true }
						thankYouImage={ thankYouImage }
						thankYouTitle={ translate( 'All ready to go!' ) }
						thankYouSubtitle={ areAllPluginsOnSite ? thankYouSubtitle : '' }
						headerBackgroundColor="#fff"
						headerTextColor="#000"
					/>
				</ThankYouContainer>
			) }
		</ThemeProvider>
	);
};

export default MarketplaceThankYou;
