import { ConfettiAnimation } from '@automattic/components';
import { ThemeProvider, Global, css } from '@emotion/react';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { ThankYou } from 'calypso/components/thank-you';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import MarketplaceProgressBar from 'calypso/my-sites/marketplace/components/progressbar';
import theme from 'calypso/my-sites/marketplace/theme';
import { requestAdminMenu } from 'calypso/state/admin-menu/actions';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import { getAutomatedTransferStatus } from 'calypso/state/automated-transfer/selectors';
import { isRequesting } from 'calypso/state/plugins/installed/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { MarketplaceGoBackSection } from './marketplace-go-back-section';
import { usePluginsThankYouData } from './use-plugins-thank-you-data';
import { useThankYouFoooter } from './use-thank-you-footer';
import { useThankYouSteps } from './use-thank-you-steps';
import { useThemesThankYouData } from './use-themes-thank-you-data';

import './style.scss';

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
	const isRequestingPlugins = useSelector( ( state ) => isRequesting( state, siteId ) );

	const defaultThankYouFooter = useThankYouFoooter( pluginSlugs, themeSlugs );

	const [ pluginsSection, allPluginsFetched, pluginsGoBackSection ] =
		usePluginsThankYouData( pluginSlugs );
	const [ themesSection, allThemesFetched, themesGoBackSection ] =
		useThemesThankYouData( themeSlugs );
	const [ hasPlugins, hasThemes ] = [ pluginSlugs, themeSlugs ].map(
		( slugs ) => slugs.length !== 0
	);

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

	const { steps, additionalSteps } = useThankYouSteps( { pluginSlugs, themeSlugs } );

	const sections = [
		...( hasThemes ? [ themesSection ] : [] ),
		...( hasPlugins ? [ pluginsSection ] : [] ),
		defaultThankYouFooter,
	];

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
			<MarketplaceGoBackSection
				pluginSlugs={ pluginSlugs }
				pluginsGoBackSection={ pluginsGoBackSection }
				themeSlugs={ themeSlugs }
				themesGoBackSection={ themesGoBackSection }
				areAllProductsFetched={ areAllProductsFetched }
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
				<div className="marketplace-thank-you__container">
					<ConfettiAnimation delay={ 1000 } />
					<ThankYou
						containerClassName="marketplace-thank-you"
						sections={ sections }
						showSupportSection={ false }
						thankYouTitle={ translate( "Congrats on your site's new superpowers!" ) }
						thankYouSubtitle={ translate(
							"Now you're really getting the most out of WordPress. Dig in and explore more of our favorite plugins."
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
