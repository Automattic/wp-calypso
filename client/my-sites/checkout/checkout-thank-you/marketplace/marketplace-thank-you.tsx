import { ConfettiAnimation } from '@automattic/components';
import { ThemeProvider, Global, css } from '@emotion/react';
import styled from '@emotion/styled';
import { Button } from '@wordpress/components';
import { Icon, table } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ThankYou } from 'calypso/components/thank-you';
import { ThankYouSectionProps } from 'calypso/components/thank-you/types';
import { useWPCOMPlugins } from 'calypso/data/marketplace/use-wpcom-plugins-query';
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
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { pluginInstallationStateChange } from 'calypso/state/marketplace/purchase-flow/actions';
import { MARKETPLACE_ASYNC_PROCESS_STATUS } from 'calypso/state/marketplace/types';
import { fetchSitePlugins } from 'calypso/state/plugins/installed/actions';
import { getPluginsOnSite, isRequesting } from 'calypso/state/plugins/installed/selectors';
import { fetchPluginData as wporgFetchPluginData } from 'calypso/state/plugins/wporg/actions';
import { areFetched, getPlugins } from 'calypso/state/plugins/wporg/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { ThankYouPluginSection } from './marketplace-thank-you-plugin-section';

const ThankYouContainer = styled.div`
	.thank-you__container {
		padding-top: var( --masterbar-height );
	}

	.thank-you__container-header {
		min-height: auto;
		padding: 0px;
		/* padding-top: 15px; */
		padding-top: 60px;
	}

	.thank-you__body {
		margin: 40px 0;

		> div {
			width: auto;
			display: flex;
			flex-direction: column;
			align-items: center;
		}

		div {
			min-width: auto;
		}
	}

	.thank-you__step div > p {
		margin-bottom: 16px;
	}

	.thank-you__header-title {
		font-family: Recoleta;
		font-size: 48px;
		line-height: 24px;
	}

	.thank-you__header-subtitle {
		margin-top: 16px;
		width: 500px;
		line-height: 24px;
		font-size: 16px;
		color: var( --studio-gray-60 );
	}

	.thank-you__footer {
		width: 1072px;
		padding: 40px;
		display: flex;
		justify-content: space-between;

		.thank-you__step {
			display: flex;
			flex-direction: column;
			flex-wrap: wrap;
			width: 270px;
			justify-content: space-between;

			h3 {
				line-height: 24px;
				font-weight: 500;
				font-size: 16px;
				color: var( --studio-gray-100 );
			}

			p {
				line-height: 20px;
				font-size: 14px;
				color: var( --studio-gray-60 );
			}
		}

		.thank-you__step-cta {
			margin: 0;
		}

		.thank-you__step-icon {
			width: 50px;
			flex-basis: 100%;
		}
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
	const currentUser = useSelector( getCurrentUser );
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
	const isFetchingTransferStatus = useSelector( ( state ) =>
		isFetchingAutomatedTransferStatus( state, siteId )
	);
	const transferStatus = useSelector( ( state ) => getAutomatedTransferStatus( state, siteId ) );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, siteId ) );
	const isJetpackSelfHosted = isJetpack && ! isAtomic;

	const [ currentStep, setCurrentStep ] = useState( 0 );
	const [ showProgressBar, setShowProgressBar ] = useState(
		! new URLSearchParams( document.location.search ).has( 'hide-progress-bar' )
	);

	const areAllPluginsOnSite =
		!! pluginsOnSite.length && pluginsOnSite.every( ( pluginOnSite ) => !! pluginOnSite );

	// Consolidate the plugin information from the .org and .com sources in a single list
	const pluginInformationList = useMemo( () => {
		return pluginsOnSite.reduce( ( pluginsList: Array< any >, pluginOnSite: Plugin ) => {
			if ( typeof pluginOnSite?.slug === 'string' ) {
				pluginsList.push( {
					...wpComPluginsData.find( ( wpComPlugin ) => wpComPlugin?.slug === pluginOnSite.slug ),
					...wporgPlugins.find( ( wpOrgPlugin ) => wpOrgPlugin?.slug === pluginOnSite.slug ),
					...pluginOnSite,
				} );
			}

			return pluginsList;
		}, [] );
	}, [ pluginsOnSite, wpComPluginsData, wporgPlugins ] );

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
	}, [ areAllWporgPluginsFetched, productSlugs, dispatch, wporgPlugins ] );

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

	const pluginsSection: ThankYouSectionProps = {
		sectionKey: 'plugin_information',
		nextSteps: pluginInformationList.map( ( plugin: any ) => ( {
			stepKey: `plugin_information_${ plugin.slug }`,
			stepDescription: <ThankYouPluginSection plugin={ plugin } />,
		} ) ),
	};

	const footerSection: ThankYouSectionProps = {
		sectionKey: 'thank_you_footer',
		nextStepsClassName: 'thank-you__footer',
		nextSteps: [
			{
				stepIcon: <Icon icon={ table } size={ 20 } />,
				stepKey: 'thank_you_footer_support_guides',
				stepTitle: translate( 'Support guides' ),
				stepDescription: translate(
					'Our guides will show you everything you need to know about plugins.'
				),
				stepCta: (
					<Button isSecondary href="https://wordpress.com/support/plugins/" target="_blank">
						{ translate( 'Plugin Support' ) }
					</Button>
				),
			},
			{
				stepIcon: <Icon icon={ table } size={ 20 } />,
				stepKey: 'thank_you_footer_explore',
				stepTitle: translate( 'Keep growing' ),
				stepDescription: translate(
					'Take your site to the next level. We have all the solutions to help you.'
				),
				stepCta: (
					<Button isPrimary href={ `/plugins/${ siteSlug }` } target="_blank">
						{ translate( 'Explore plugins' ) }
					</Button>
				),
			},
			{
				stepIcon: <Icon icon={ table } size={ 20 } />,
				stepKey: 'thank_you_footer_support',
				stepTitle: translate( 'How can we support?' ),
				stepDescription: translate(
					'Our team is here if you need help, or if you have any questions.'
				),
				stepCta: (
					<Button isSecondary href="https://wordpress.com/help/contact" target="_blank">
						{ translate( 'Ask a question' ) }
					</Button>
				),
			},
		],
	};

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
					<ConfettiAnimation />
					<ThankYou
						containerClassName="marketplace-thank-you"
						sections={ [ pluginsSection, footerSection ] }
						showSupportSection={ false }
						thankYouTitle={ translate( "You're all set %(username)s!", {
							args: {
								username: currentUser?.display_name || currentUser?.username,
							},
						} ) }
						thankYouSubtitle={ translate(
							'Congratulations on your installation. You can now extend the possibilities of your site.'
						) }
						headerBackgroundColor="#fff"
						headerTextColor="#000"
					/>
				</ThankYouContainer>
			) }
		</ThemeProvider>
	);
};

export default MarketplaceThankYou;
