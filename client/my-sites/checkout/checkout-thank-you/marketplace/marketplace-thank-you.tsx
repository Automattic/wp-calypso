import { ThemeProvider, Global, css } from '@emotion/react';
import { useTranslate } from 'i18n-calypso';
import { useEffect } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import ThankYouV2 from 'calypso/components/thank-you-v2';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import MarketplaceProgressBar from 'calypso/my-sites/marketplace/components/progressbar';
import theme from 'calypso/my-sites/marketplace/theme';
import { useSelector, useDispatch } from 'calypso/state';
import { requestAdminMenu } from 'calypso/state/admin-menu/actions';
import { transferStates } from 'calypso/state/automated-transfer/constants';
import { getAutomatedTransferStatus } from 'calypso/state/automated-transfer/selectors';
import { isRequesting } from 'calypso/state/plugins/installed/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { getSiteAdminUrl, isJetpackSite } from 'calypso/state/sites/selectors';
import { setThemePreviewOptions } from 'calypso/state/themes/actions';
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
	isOnboardingFlow,
	styleVariationSlug,
	continueWithPluginBundle,
}: {
	pluginSlugs: Array< string >;
	themeSlugs: Array< string >;
	isOnboardingFlow: boolean;
	styleVariationSlug: string | null;
	continueWithPluginBundle: boolean | null;
} ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const siteId = useSelector( getSelectedSiteId );
	const isRequestingPlugins = useSelector( ( state ) =>
		siteId ? isRequesting( state, siteId ) : false
	);

	const [
		pluginsSection,
		allPluginsFetched,
		allPluginsActivated,
		pluginsGoBackSection,
		pluginTitle,
		pluginSubtitle,
		pluginsProgressbarSteps,
		isAtomicNeededForPlugins,
		thankYouHeaderActionForPlugins,
		isLoadedPlugins,
	] = usePluginsThankYouData( pluginSlugs );
	const [
		firstTheme,
		themesSection,
		allThemesFetched,
		themesGoBackSection,
		themeTitle,
		themeSubtitle,
		themesProgressbarSteps,
		isAtomicNeededForThemes,
		thankYouHeaderActionForThemes,
		isLoadedThemes,
	] = useThemesThankYouData( themeSlugs, isOnboardingFlow, continueWithPluginBundle );

	useEffect( () => {
		if ( firstTheme && styleVariationSlug ) {
			const styleVariation = firstTheme.style_variations.find(
				( variation: { slug: string } ) => variation.slug === styleVariationSlug
			);

			if ( styleVariation ) {
				dispatch( setThemePreviewOptions( firstTheme.id, null, null, { styleVariation } ) );
			}
		}
	}, [ dispatch, firstTheme, styleVariationSlug ] );

	const [ hasThemes ] = [ themeSlugs ].map( ( slugs ) => slugs.length !== 0 );

	const [ title, subtitle ] = usePageTexts( {
		pluginSlugs,
		themeSlugs,
		pluginTitle,
		pluginSubtitle,
		themeTitle,
		themeSubtitle,
	} );

	const isAtomicNeeded = isAtomicNeededForPlugins || isAtomicNeededForThemes || ! allThemesFetched;
	const [ isAtomicTransferCheckComplete, currentStep, showProgressBar, setShowProgressBar ] =
		useAtomicTransfer( isAtomicNeeded );

	const isPageReady =
		allPluginsFetched &&
		allPluginsActivated &&
		allThemesFetched &&
		isAtomicTransferCheckComplete &&
		isLoadedPlugins &&
		( ! hasThemes || isLoadedThemes );

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

	const pluginsUrl = useSelector( ( state ) => {
		return getSiteAdminUrl( state, siteId, 'plugins.php?activate=true&plugin_status=active' );
	} );
	// Set progressbar (currentStep) depending on transfer/plugin status.
	useEffect( () => {
		// We don't want to show the progress bar again when it is hidden.
		if ( ! showProgressBar ) {
			return;
		}

		// Redirect to plugins.php if there are only plugins and no themes.
		if ( isPageReady && pluginSlugs.length > 0 && themeSlugs.length === 0 && pluginsUrl ) {
			window.location.href = pluginsUrl;
			return;
		}

		setShowProgressBar( ! isPageReady );
	}, [
		setShowProgressBar,
		showProgressBar,
		isPageReady,
		pluginSlugs.length,
		themeSlugs.length,
		pluginsUrl,
	] );

	const { steps, additionalSteps } = useThankYouSteps( {
		pluginSlugs,
		themeSlugs,
		pluginsProgressbarSteps,
		themesProgressbarSteps,
	} );

	let products = pluginsSection ?? [];

	if ( hasThemes ) {
		products = products.concat( themesSection );
	}

	const footerDetails = useThankYouFoooter( pluginSlugs, themeSlugs );

	return (
		<ThemeProvider theme={ theme }>
			<DocumentHead title={ translate( 'Next steps' ) } />
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
				<Main className="marketplace-thank-you__container">
					<ThankYouV2
						title={ title }
						subtitle={ subtitle }
						headerButtons={ thankYouHeaderActionForPlugins || thankYouHeaderActionForThemes }
						products={ products }
						footerDetails={ footerDetails }
						showSuccessAnimation={ hasThemes }
					/>
				</Main>
			) }
		</ThemeProvider>
	);
};

export default MarketplaceThankYou;
