import { recordTracksEvent } from '@automattic/calypso-analytics';
import { ConfettiAnimation, Gridicon } from '@automattic/components';
import { ThemeProvider, Global, css } from '@emotion/react';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import QueryTheme from 'calypso/components/data/query-theme';
import { ThankYou } from 'calypso/components/thank-you';
import { ThankYouSectionProps } from 'calypso/components/thank-you/types';
import { useWPCOMPlugins } from 'calypso/data/marketplace/use-wpcom-plugins-query';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
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
import { areFetched, areFetching, getPlugins } from 'calypso/state/plugins/wporg/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getThemes } from 'calypso/state/themes/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import { ThankYouPluginSection } from './marketplace-thank-you-plugin-section';
import './style.scss';

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
	const areWporgPluginsFetched: Array< boolean > = useSelector(
		( state ) => areFetched( state, productSlugs ),
		( newValues: Array< boolean >, oldValues: Array< boolean > ) =>
			newValues.every( ( newValue, i ) => newValue === oldValues[ i ] )
	);
	const areWporgPluginsFetching: Array< boolean > = useSelector( ( state ) =>
		areFetching( state, productSlugs )
	);
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

	// Retrieve theme information
	const dotComThemes = useSelector( ( state ) => getThemes( state, 'wpcom', productSlugs ) );
	const dotOrgThemes = useSelector( ( state ) => getThemes( state, 'wporg', productSlugs ) );

	const areAllProductsFetched =
		!! pluginsOnSite.length &&
		pluginsOnSite.every(
			( pluginOnSite, index ) =>
				!! pluginOnSite || !! dotComThemes[ index ] || !! dotOrgThemes[ index ]
		);

	// Consolidate the plugin information from the .org and .com sources in a single list
	const productInformationList = useMemo( () => {
		return pluginsOnSite.reduce(
			( productsList: Array< any >, pluginOnSite: Plugin, index: number ) => {
				productsList.push( {
					...wpComPluginsData[ index ],
					...wporgPlugins[ index ],
					...pluginOnSite,
					...dotComThemes[ index ],
					...dotOrgThemes[ index ],
					product_type: getProductType( dotComThemes, dotOrgThemes, index ),
				} );

				return productsList;
			},
			[]
		);
	}, [ pluginsOnSite, wpComPluginsData, wporgPlugins, dotComThemes, dotOrgThemes ] );

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
			areWporgPluginsFetched.forEach( ( isPluginFetched, index ) => {
				const isPluginFeching = areWporgPluginsFetching[ index ];
				if ( ! isPluginFetched && ! isPluginFeching ) {
					dispatch( wporgFetchPluginData( productSlugs[ index ] ) );
				}
			} );
		}

		// We don't want it to run at every change of areWporgPluginsFetching,
		// we only rerun when areWporgPluginsFetched changes
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ areAllWporgPluginsFetched, areWporgPluginsFetched, productSlugs, dispatch, wporgPlugins ] );

	// Site is already Atomic (or just transferred).
	// Poll the plugin installation status.
	useEffect( () => {
		if ( ! siteId || ( ! isJetpackSelfHosted && transferStatus !== transferStates.COMPLETE ) ) {
			return;
		}

		// Update the menu after the plugin has been installed, since that might change some menu items.
		if ( areAllProductsFetched ) {
			dispatch( requestAdminMenu( siteId ) );
			return;
		}

		if ( ! isRequestingPlugins ) {
			waitFor( 1 ).then( () => dispatch( fetchSitePlugins( siteId ) ) );
		}
	}, [
		isRequestingPlugins,
		areAllProductsFetched,
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

		setShowProgressBar( ! areAllProductsFetched );

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
	}, [ transferStatus, areAllProductsFetched, showProgressBar, isJetpack ] );

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
		nextSteps: productInformationList
			.filter( ( product ) => product.product_type === 'plugin' )
			.map( ( plugin: any ) => ( {
				stepKey: `plugin_information_${ plugin.slug }`,
				stepSection: <ThankYouPluginSection plugin={ plugin } />,
			} ) ),
	};

	const sendTrackEvent = useCallback(
		( name: string ) => {
			recordTracksEvent( name, {
				site_id: siteId,
				plugins: productSlugs.join( '/' ),
			} );
		},
		[ siteId, productSlugs ]
	);

	const footerSection: ThankYouSectionProps = {
		sectionKey: 'thank_you_footer',
		nextStepsClassName: 'thank-you__footer',
		nextSteps: [
			{
				stepIcon: <FooterIcon icon="next-page" />,
				stepKey: 'thank_you_footer_support_guides',
				stepTitle: translate( 'Support guides' ),
				stepDescription: translate(
					'Our guides will show you everything you need to know about plugins.'
				),
				stepCta: (
					<Button
						isSecondary
						href="https://wordpress.com/support/plugins/"
						target="_blank"
						onClick={ () => sendTrackEvent( 'calypso_plugin_thank_you_plugin_support_click' ) }
					>
						{ translate( 'Plugin Support' ) }
					</Button>
				),
			},
			{
				stepIcon: <FooterIcon icon="create" />,
				stepKey: 'thank_you_footer_explore',
				stepTitle: translate( 'Keep growing' ),
				stepDescription: translate(
					'Take your site to the next level. We have all the solutions to help you.'
				),
				stepCta: (
					<Button
						isPrimary
						href={ `/plugins/${ siteSlug }` }
						target="_blank"
						onClick={ () => sendTrackEvent( 'calypso_plugin_thank_you_explore_plugins_click' ) }
					>
						{ translate( 'Explore plugins' ) }
					</Button>
				),
			},
			{
				stepIcon: <FooterIcon icon="help-outline" />,
				stepKey: 'thank_you_footer_support',
				stepTitle: translate( 'How can we support you?' ),
				stepDescription: translate(
					'Our team is here if you need help, or if you have any questions.'
				),
				stepCta: (
					<Button
						isSecondary
						href="https://wordpress.com/help/contact"
						target="_blank"
						onClick={ () => sendTrackEvent( 'calypso_plugin_thank_you_ask_question_click' ) }
					>
						{ translate( 'Ask a question' ) }
					</Button>
				),
			},
		],
	};

	return (
		<ThemeProvider theme={ theme }>
			<PageViewTracker
				path="/marketplace/thank-you/:productSlug/:site"
				title="Marketplace > Thank you"
			/>
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
				canGoBack={ areAllProductsFetched }
			/>
			{ productSlugs.map( ( productSlug, index ) => (
				<>
					<QueryTheme key={ 'query-theme-' + index } siteId="wpcom" themeId={ productSlug } />
					<QueryTheme key={ 'query-theme-' + index } siteId="wporg" themeId={ productSlug } />
				</>
			) ) }
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
				<div className="marketplace-thank-you__container">
					<ConfettiAnimation delay={ 1000 } />
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
				</div>
			) }
		</ThemeProvider>
	);
};

/**
 * Returns the type of the product, having 'plugin' as default
 *
 * @param dotComThemes list of WordPress.com themes
 * @param dotOrgThemes list of WordPress.org themes
 * @param index current index to search on the list
 * @returns 'theme'| 'plugin' the type of the product
 */
function getProductType( dotComThemes: [], dotOrgThemes: [], index: number ): 'theme' | 'plugin' {
	if ( dotComThemes[ index ] || dotOrgThemes[ index ] ) {
		return 'theme';
	}

	return 'plugin';
}

function FooterIcon( { icon }: { icon: string } ) {
	return (
		<Gridicon
			className="marketplace-thank-you__footer-icon"
			size={ 18 }
			color="var(--studio-gray-30)"
			icon={ icon }
		/>
	);
}

export default MarketplaceThankYou;
