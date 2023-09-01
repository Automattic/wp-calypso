import { ConfettiAnimation } from '@automattic/components';
import { ThemeProvider, Global, css } from '@emotion/react';
import { useEffect } from 'react';
import QuerySites from 'calypso/components/data/query-sites';
import { ThankYou } from 'calypso/components/thank-you';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import MarketplaceProgressBar from 'calypso/my-sites/marketplace/components/progressbar';
import theme from 'calypso/my-sites/marketplace/theme';
import { useSelector, useDispatch } from 'calypso/state';
import { requestAdminMenu } from 'calypso/state/admin-menu/actions';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import { getAutomatedTransferStatus } from 'calypso/state/automated-transfer/selectors';
import { isRequesting } from 'calypso/state/plugins/installed/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { MarketplaceGoBackSection } from './marketplace-go-back-section';
import { useAtomicTransfer } from './use-atomic-transfer';
import { usePageTexts } from './use-page-texts';
import usePluginsThankYouData from './use-plugins-thank-you-data';
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
	const siteId = useSelector( getSelectedSiteId );
	const isRequestingPlugins = useSelector( ( state ) =>
		siteId ? isRequesting( state, siteId ) : false
	);

	const defaultThankYouFooter = useThankYouFoooter( pluginSlugs, themeSlugs );

	const [
		pluginsSection,
		allPluginsFetched,
		pluginsGoBackSection,
		pluginTitle,
		pluginSubtitle,
		pluginsProgressbarSteps,
		isAtomicNeededForPlugins,
		thankYouHeaderAction,
	] = usePluginsThankYouData( pluginSlugs );
	const [
		themesSection,
		allThemesFetched,
		themesGoBackSection,
		themeTitle,
		themeSubtitle,
		themesProgressbarSteps,
		isAtomicNeededForThemes,
	] = useThemesThankYouData( themeSlugs );

	console.log( { isAtomicNeededForThemes } );

	const [ hasPlugins, hasThemes ] = [ pluginSlugs, themeSlugs ].map(
		( slugs ) => slugs.length !== 0
	);

	const [ title, subtitle ] = usePageTexts( {
		pluginSlugs,
		themeSlugs,
		pluginTitle,
		pluginSubtitle,
		themeTitle,
		themeSubtitle,
	} );

	const isAtomicNeeded = isAtomicNeededForPlugins || isAtomicNeededForThemes;
	const [ isAtomicTransferCheckComplete, currentStep, showProgressBar, setShowProgressBar ] =
		useAtomicTransfer( isAtomicNeeded );

	console.log( {
		isAtomicTransferCheckComplete,
		currentStep,
		showProgressBar,
		setShowProgressBar,
	} );

	const isPageReady = allPluginsFetched && allThemesFetched && isAtomicTransferCheckComplete;

	const transferStatus = useSelector( ( state ) => getAutomatedTransferStatus( state, siteId ) );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, siteId ) );
	const isJetpackSelfHosted = isJetpack && ! isAtomic;

	// Site is already Atomic (or just transferred).
	// Poll the plugin installation status.
	useEffect( () => {
		if ( ! siteId || ( ! isJetpackSelfHosted && transferStatus !== transferStates.COMPLETE ) ) {
			return;
		}

		// Update the menu after the plugin has been installed, since that might change some menu items.
		if ( isPageReady ) {
			dispatch( requestAdminMenu( siteId ) );
			return;
		}
	}, [ isRequestingPlugins, isPageReady, dispatch, siteId, transferStatus, isJetpackSelfHosted ] );

	// Set progressbar (currentStep) depending on transfer/plugin status.
	useEffect( () => {
		// We don't want to show the progress bar again when it is hidden.
		if ( ! showProgressBar ) {
			return;
		}

		setShowProgressBar( ! isPageReady );
	}, [ setShowProgressBar, showProgressBar, isPageReady ] );

	const { steps, additionalSteps } = useThankYouSteps( {
		pluginSlugs,
		themeSlugs,
		pluginsProgressbarSteps,
		themesProgressbarSteps,
	} );

	const sections = [
		...( hasThemes ? [ themesSection ] : [] ),
		...( hasPlugins ? [ pluginsSection ] : [] ),
		defaultThankYouFooter,
	];

	console.log( { isSiteAtomic: isSiteAtomic( getState(), siteId ) } );

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
				areAllProductsFetched={ isPageReady }
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
					<QuerySites siteId={ siteId } />
					<ThankYou
						containerClassName="marketplace-thank-you"
						sections={ sections }
						showSupportSection={ false }
						thankYouTitle={ title }
						thankYouSubtitle={ subtitle }
						thankYouHeaderBody={ thankYouHeaderAction }
						headerBackgroundColor="#fff"
						headerTextColor="#000"
					/>
				</div>
			) }
		</ThemeProvider>
	);
};

export default MarketplaceThankYou;
