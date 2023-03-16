import { ConfettiAnimation } from '@automattic/components';
import { ThemeProvider, Global, css } from '@emotion/react';
import { useTranslate } from 'i18n-calypso';
import page from 'page';
import { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import QueryTheme from 'calypso/components/data/query-theme';
import { ThankYou } from 'calypso/components/thank-you';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import MasterbarStyled from 'calypso/my-sites/marketplace/components/masterbar-styled';
import MarketplaceProgressBar from 'calypso/my-sites/marketplace/components/progressbar';
import useMarketplaceAdditionalSteps from 'calypso/my-sites/marketplace/pages/marketplace-plugin-install/use-marketplace-additional-steps';
import theme from 'calypso/my-sites/marketplace/theme';
import { requestAdminMenu } from 'calypso/state/admin-menu/actions';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import { getAutomatedTransferStatus } from 'calypso/state/automated-transfer/selectors';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { isRequesting } from 'calypso/state/plugins/installed/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import './style.scss';
import { useDefaultThankYouFoooter } from './use-default-thank-you-footer';
import { usePluginsThankYouData } from './use-plugins-thank-you-data';
import { useThemesThankYouData } from './use-themes-thank-you-data';

const MarketplaceThankYou = ( {
	pluginSlugs,
	themeSlugs,
}: {
	pluginSlugs: Array< string >;
	themeSlugs: Array< string >;
} ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( getSelectedSiteSlug );
	const currentUser = useSelector( getCurrentUser );
	const isRequestingPlugins = useSelector( ( state ) => isRequesting( state, siteId ) );

	const allSlugs = useMemo( () => [ ...pluginSlugs, ...themeSlugs ], [ pluginSlugs, themeSlugs ] );
	const defaultThankYouFooter = useDefaultThankYouFoooter( allSlugs );

	const [ pluginsSection, allPluginsFetched ] = usePluginsThankYouData( pluginSlugs );
	const [ themesSection, allThemesFetched ] = useThemesThankYouData( themeSlugs );

	const areAllProductsFetched = allPluginsFetched && allThemesFetched;

	const transferStatus = useSelector( ( state ) => getAutomatedTransferStatus( state, siteId ) );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, siteId ) );
	const isJetpackSelfHosted = isJetpack && ! isAtomic;

	const [ currentStep, setCurrentStep ] = useState( 0 );
	const [ showProgressBar, setShowProgressBar ] = useState(
		! new URLSearchParams( document.location.search ).has( 'hide-progress-bar' )
	);

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

	// TODO: Use more general steps (not specific to plugins)
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

	return (
		<ThemeProvider theme={ theme }>
			<PageViewTracker path="/marketplace/thank-you/:site" title="Marketplace > Thank you" />
			{ /* Using Global to override Global masterbar height */ }
			<Global
				styles={ css`
					body.is-section-marketplace {
						--masterbar-height: 72px;
					}
				` }
			/>
			{ /* TODO: Update the masterbar according the product type */ }
			<MasterbarStyled
				onClick={ () => page( `/plugins/${ siteSlug }` ) }
				backText={ translate( 'Back to plugins' ) }
				canGoBack={ areAllProductsFetched }
			/>
			{ /* TODO: Remove after https://github.com/Automattic/wp-calypso/issues/74532 and move it to useThemesThankYouData */ }
			{ themeSlugs.map( ( themeSlug, index ) => (
				<>
					<QueryTheme key={ 'query-wpcom-theme-' + index } siteId="wpcom" themeId={ themeSlug } />
					<QueryTheme key={ 'query-wporg-theme-' + index } siteId="wporg" themeId={ themeSlug } />
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
						sections={ [ themesSection, pluginsSection, defaultThankYouFooter ] }
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

export default MarketplaceThankYou;
