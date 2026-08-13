import { recordTracksEvent } from '@automattic/calypso-analytics';
import { Button } from '@automattic/components';
import { ThemeProvider, Global, css } from '@emotion/react';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import Main from 'calypso/components/main';
import Notice from 'calypso/components/notice';
import ThankYouV2 from 'calypso/components/thank-you-v2';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import MarketplaceProgressBar from 'calypso/my-sites/marketplace/components/progressbar';
import theme from 'calypso/my-sites/marketplace/theme';
import { useSelector, useDispatch } from 'calypso/state';
import { requestAdminMenu } from 'calypso/state/admin-menu/actions';
import { transferCompleteStates } from 'calypso/state/automated-transfer/constants';
import { getAutomatedTransferStatus } from 'calypso/state/automated-transfer/selectors';
import { isRequesting } from 'calypso/state/plugins/installed/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { getSiteAdminUrl, isJetpackSite } from 'calypso/state/sites/selectors';
import { setThemePreviewOptions } from 'calypso/state/themes/actions';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getThankYouError, type ThankYouError } from './get-thank-you-error';
import { MarketplaceGoBackSection } from './marketplace-go-back-section';
import { useAtomicTransfer } from './use-atomic-transfer';
import { usePageTexts } from './use-page-texts';
import usePluginsThankYouData from './use-plugins-thank-you-data';
import { useThankYouDeadline } from './use-thank-you-deadline';
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
	const productKey = useMemo(
		() =>
			`plugins:${ [ ...pluginSlugs ].sort().join( ',' ) };themes:${ [ ...themeSlugs ]
				.sort()
				.join( ',' ) }`,
		[ pluginSlugs, themeSlugs ]
	);
	const {
		isInitialized: isDeadlineInitialized,
		hasTimedOut,
		getWaitedSeconds,
		restart: restartDeadline,
		complete: completeWait,
	} = useThankYouDeadline( {
		siteId,
		productKey,
		enabled: pluginSlugs.length > 0 || themeSlugs.length > 0,
	} );

	const {
		pluginsSection,
		allPluginsFetched,
		allPluginsActivated,
		pluginTitle,
		pluginSubtitle,
		pluginsProgressbarSteps,
		isAtomicNeeded: isAtomicNeededForPlugins,
		thankYouHeaderAction: thankYouHeaderActionForPlugins,
		isLoaded: isLoadedPlugins,
		retry: retryPlugins,
	} = usePluginsThankYouData( pluginSlugs, hasTimedOut );
	const {
		firstTheme,
		themesSection,
		allThemesFetched,
		themeTitle,
		themeSubtitle,
		themesProgressbarSteps,
		isAtomicNeeded: isAtomicNeededForThemes,
		thankYouHeaderAction: thankYouHeaderActionForThemes,
		isLoaded: isLoadedThemes,
		retry: retryThemes,
	} = useThemesThankYouData( themeSlugs, isOnboardingFlow, continueWithPluginBundle );

	useEffect( () => {
		if ( firstTheme && styleVariationSlug ) {
			const styleVariation = firstTheme.style_variations.find(
				( variation: { slug?: string } ) => variation.slug === styleVariationSlug
			);

			if ( styleVariation ) {
				dispatch( setThemePreviewOptions( firstTheme.id, null, null, { styleVariation } ) );
			}
		}
	}, [ dispatch, firstTheme, styleVariationSlug ] );

	const hasPlugins = pluginSlugs.length > 0;
	const hasThemes = themeSlugs.length > 0;

	const [ title, subtitle ] = usePageTexts( {
		pluginSlugs,
		themeSlugs,
		pluginTitle,
		pluginSubtitle,
		themeTitle,
		themeSubtitle,
	} );

	const isAtomicNeeded = isAtomicNeededForPlugins || isAtomicNeededForThemes || ! allThemesFetched;
	const {
		isAtomicTransferCheckComplete,
		currentStep,
		showProgressBar,
		setShowProgressBar,
		isRetryingTransferStatus,
		trustedTransferStatus,
		retry: retryAtomicTransfer,
	} = useAtomicTransfer( isAtomicNeeded, hasTimedOut, isDeadlineInitialized );

	const isPageReady =
		allPluginsFetched &&
		allPluginsActivated &&
		allThemesFetched &&
		isAtomicTransferCheckComplete &&
		( ! hasPlugins || isLoadedPlugins ) &&
		( ! hasThemes || isLoadedThemes );

	const transferStatus = useSelector( ( state ) => getAutomatedTransferStatus( state, siteId ) );
	const thankYouError = getThankYouError( {
		transferStatus: isRetryingTransferStatus ? null : trustedTransferStatus,
		hasTimedOut,
		isPageReady,
	} );
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, siteId ) );
	const isJetpackSelfHosted = isJetpack && ! isAtomic;

	// Site is already Atomic (or just transferred).
	// Poll the plugin installation status.
	useEffect( () => {
		if (
			! siteId ||
			( ! isJetpackSelfHosted && ! transferCompleteStates.includes( transferStatus ) )
		) {
			return;
		}

		// Update the menu after the plugin has been installed, since that might change some menu items.
		if ( isPageReady ) {
			dispatch( requestAdminMenu( siteId ) );
			return;
		}
	}, [ isRequestingPlugins, isPageReady, dispatch, siteId, transferStatus, isJetpackSelfHosted ] );

	useEffect( () => {
		if ( isPageReady ) {
			completeWait();
		}
	}, [ completeWait, isPageReady ] );

	const reportedErrorRef = useRef< ThankYouError >( null );
	useEffect( () => {
		if ( ! thankYouError ) {
			reportedErrorRef.current = null;
			return;
		}
		if ( reportedErrorRef.current === thankYouError ) {
			return;
		}

		reportedErrorRef.current = thankYouError;
		recordTracksEvent( 'calypso_marketplace_thank_you_wait_ended', {
			error: thankYouError,
			transfer_status: trustedTransferStatus,
			waited_seconds: getWaitedSeconds(),
			plugin_slugs: pluginSlugs.join( ',' ),
		} );
	}, [ getWaitedSeconds, pluginSlugs, thankYouError, trustedTransferStatus ] );

	const retry = useCallback( () => {
		restartDeadline();
		retryAtomicTransfer();
		retryPlugins();
		retryThemes();
		setShowProgressBar( true );
	}, [ restartDeadline, retryAtomicTransfer, retryPlugins, retryThemes, setShowProgressBar ] );

	const pluginsUrl = useSelector( ( state ) => {
		return getSiteAdminUrl( state, siteId, 'plugins.php?activate=true&plugin_status=active' );
	} );
	// Set progressbar (currentStep) depending on transfer/plugin status.
	const previousThankYouErrorRef = useRef< ThankYouError >( null );
	useEffect( () => {
		if ( thankYouError ) {
			previousThankYouErrorRef.current = thankYouError;
			setShowProgressBar( false );
			return;
		}
		if ( previousThankYouErrorRef.current ) {
			previousThankYouErrorRef.current = null;
			setShowProgressBar( ! isPageReady );
			return;
		}

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
		thankYouError,
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
			<MarketplaceGoBackSection pluginSlugs={ pluginSlugs } themeSlugs={ themeSlugs } />
			{ showProgressBar && ! thankYouError && (
				// eslint-disable-next-line wpcalypso/jsx-classname-namespace
				<div className="marketplace-plugin-install__root">
					<MarketplaceProgressBar
						steps={ steps }
						currentStep={ currentStep }
						additionalSteps={ additionalSteps }
					/>
				</div>
			) }
			{ thankYouError && (
				<Main className="marketplace-thank-you__container">
					<Notice
						status="is-error"
						showDismiss={ false }
						text={
							thankYouError === 'transfer-failed'
								? translate( "Sorry, we couldn't process your transfer. Please try again later." )
								: translate( 'Setting up your site is taking longer than expected.' )
						}
					/>
					<Button className="marketplace-thank-you__retry-button" onClick={ retry }>
						{ translate( 'Check again' ) }
					</Button>
				</Main>
			) }
			{ ! showProgressBar && ! thankYouError && (
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
