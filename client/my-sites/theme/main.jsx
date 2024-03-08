import { getTracksAnonymousUserId } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import {
	FEATURE_UPLOAD_THEMES_PLUGINS,
	FEATURE_UPLOAD_THEMES,
	PLAN_BUSINESS,
	PLAN_PREMIUM,
	WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED,
	WPCOM_FEATURES_INSTALL_PLUGINS,
	getPlan,
	PLAN_PERSONAL,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Button, Card, Gridicon } from '@automattic/components';
import {
	BUNDLED_THEME,
	DEFAULT_GLOBAL_STYLES_VARIATION_SLUG,
	DOT_ORG_THEME,
	ThemePreview as ThemeWebPreview,
	getDesignPreviewUrl,
	isDefaultGlobalStylesVariationSlug,
} from '@automattic/design-picker';
import { localizeUrl } from '@automattic/i18n-utils';
import { createHigherOrderComponent } from '@wordpress/compose';
import classNames from 'classnames';
import { localize, getLocaleSlug } from 'i18n-calypso';
import photon from 'photon';
import PropTypes from 'prop-types';
import { cloneElement, Component } from 'react';
import { connect } from 'react-redux';
import titlecase from 'to-title-case';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import AsyncLoad from 'calypso/components/async-load';
import Banner from 'calypso/components/banner';
import DocumentHead from 'calypso/components/data/document-head';
import QueryActiveTheme from 'calypso/components/data/query-active-theme';
import QueryCanonicalTheme from 'calypso/components/data/query-canonical-theme';
import QueryProductsList from 'calypso/components/data/query-products-list';
import QuerySitePlans from 'calypso/components/data/query-site-plans';
import QuerySitePurchases from 'calypso/components/data/query-site-purchases';
import QueryUserPurchases from 'calypso/components/data/query-user-purchases';
import SyncActiveTheme from 'calypso/components/data/sync-active-theme';
import HeaderCake from 'calypso/components/header-cake';
import InlineSupportLink from 'calypso/components/inline-support-link';
import Main from 'calypso/components/main';
import PremiumGlobalStylesUpgradeModal from 'calypso/components/premium-global-styles-upgrade-modal';
import SectionHeader from 'calypso/components/section-header';
import ThemeSiteSelectorModal from 'calypso/components/theme-site-selector-modal';
import { THEME_TIERS } from 'calypso/components/theme-tier/constants';
import ThemeTierBadge from 'calypso/components/theme-tier/theme-tier-badge';
import PageViewTracker from 'calypso/lib/analytics/page-view-tracker';
import { decodeEntities, preventWidows } from 'calypso/lib/formatting';
import { PerformanceTrackerStop } from 'calypso/lib/performance-tracking';
import { ReviewsSummary } from 'calypso/my-sites/marketplace/components/reviews-summary';
import { useBundleSettingsByTheme } from 'calypso/my-sites/theme/hooks/use-bundle-settings';
import ActivationModal from 'calypso/my-sites/themes/activation-modal';
import { localizeThemesPath, shouldSelectSite } from 'calypso/my-sites/themes/helpers';
import ThanksModal from 'calypso/my-sites/themes/thanks-modal';
import { connectOptions } from 'calypso/my-sites/themes/theme-options';
import ThemePreview from 'calypso/my-sites/themes/theme-preview';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserSiteCount, isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { productToBeInstalled } from 'calypso/state/marketplace/purchase-flow/actions';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import { getProductsList } from 'calypso/state/products-list/selectors';
import { isUserPaid } from 'calypso/state/purchases/selectors';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import getProductionSiteForWpcomStaging from 'calypso/state/selectors/get-production-site-for-wpcom-staging';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteWpcomStaging from 'calypso/state/selectors/is-site-wpcom-staging';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { useSiteGlobalStylesStatus } from 'calypso/state/sites/hooks/use-site-global-styles-status';
import { isSiteOnECommerceTrial } from 'calypso/state/sites/plans/selectors';
import { getSiteSlug, isJetpackSite } from 'calypso/state/sites/selectors';
import {
	setThemePreviewOptions,
	themeStartActivationSync as themeStartActivationSyncAction,
} from 'calypso/state/themes/actions';
import { useIsThemeAllowedOnSite } from 'calypso/state/themes/hooks/use-is-theme-allowed-on-site';
import { useThemeTierForTheme } from 'calypso/state/themes/hooks/use-theme-tier-for-theme';
import {
	doesThemeBundleSoftwareSet,
	isThemeActive,
	isThemePremium,
	isPremiumThemeAvailable,
	isSiteEligibleForBundledSoftware,
	isWpcomTheme as isThemeWpcom,
	isWporgTheme,
	getCanonicalTheme,
	getPremiumThemePrice,
	getTheme,
	getThemeDemoUrl,
	getThemeDetailsUrl,
	getThemeForumUrl,
	getThemeRequestErrors,
	shouldShowTryAndCustomize,
	isExternallyManagedTheme as getIsExternallyManagedTheme,
	isSiteEligibleForManagedExternalThemes as getIsSiteEligibleForManagedExternalThemes,
	isMarketplaceThemeSubscribed as getIsMarketplaceThemeSubscribed,
	isThemeActivationSyncStarted as getIsThemeActivationSyncStarted,
	getIsLivePreviewSupported,
	getThemeType,
	isThemeWooCommerce,
} from 'calypso/state/themes/selectors';
import { getIsLoadingCart } from 'calypso/state/themes/selectors/get-is-loading-cart';
import { getBackPath } from 'calypso/state/themes/themes-ui/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { ReviewsModal } from '../marketplace/components/reviews-modal';
import EligibilityWarningModal from '../themes/atomic-transfer-dialog';
import { LivePreviewButton } from './live-preview-button';
import ThemeDownloadCard from './theme-download-card';
import ThemeFeaturesCard from './theme-features-card';
import ThemeNotFoundError from './theme-not-found-error';
import ThemeStyleVariations from './theme-style-variations';

import './style.scss';

const noop = () => {};

/**
 * Renders the description for the banner upsell.
 * It's a workaround to use hooks in the class component.
 * @param {Object} props
 * @param {string} props.themeId
 * @param {boolean} props.isBundledSoftwareSet
 * @param {boolean} props.isExternallyManagedTheme
 * @param {Function} props.translate
 * @param {boolean} props.isSiteEligibleForManagedExternalThemes
 * @param {boolean} props.isMarketplaceThemeSubscribed
 * @returns {string} The description for the banner upsell.
 */
const BannerUpsellDescription = ( {
	themeId,
	isBundledSoftwareSet,
	isExternallyManagedTheme,
	translate,
	isSiteEligibleForManagedExternalThemes,
	isMarketplaceThemeSubscribed,
} ) => {
	const bundleSettings = useBundleSettingsByTheme( themeId );

	if ( isBundledSoftwareSet && ! isExternallyManagedTheme ) {
		if ( ! bundleSettings ) {
			return translate(
				'This theme comes bundled with a plugin. Upgrade to a %(businessPlanName)s plan to select this theme and unlock all its features.',
				{ args: { businessPlanName: getPlan( PLAN_BUSINESS ).getTitle() } }
			);
		}

		return bundleSettings.bannerUpsellDescription;
	} else if ( isExternallyManagedTheme && ! isMarketplaceThemeSubscribed ) {
		if ( ! isSiteEligibleForManagedExternalThemes ) {
			return translate(
				'Unlock this theme by upgrading to a %(businessPlanName)s plan and subscribing to this theme.',
				{ args: { businessPlanName: getPlan( PLAN_BUSINESS ).getTitle() } }
			);
		}
		return translate( 'Subscribe to this theme and unlock all its features.' );
	}

	return translate(
		'Instantly unlock more themes and storage space, advanced customization, video support, and more when you upgrade.'
	);
};

/**
 * Renders the title for the banner upsell.
 * It's a workaround to use hooks in the class component.
 * @param {Object} props
 * @param {string} props.themeId
 * @param {boolean} props.isBundledSoftwareSet
 * @param {boolean} props.isExternallyManagedTheme
 * @param {Function} props.translate
 * @param {boolean} props.isSiteEligibleForManagedExternalThemes
 * @param {boolean} props.isMarketplaceThemeSubscribed
 * @param {boolean} props.isThemeAllowed
 * @param {Object} props.themeTier
 * @returns {string} The title for the banner upsell.
 */
const BannerUpsellTitle = ( {
	themeId,
	isBundledSoftwareSet,
	isExternallyManagedTheme,
	translate,
	isSiteEligibleForManagedExternalThemes,
	isMarketplaceThemeSubscribed,
	isThemeAllowed,
	themeTier,
} ) => {
	const bundleSettings = useBundleSettingsByTheme( themeId );

	const premiumPlanTitle = () =>
		translate(
			'Access this theme for FREE with a %(premiumPlanName)s or %(businessPlanName)s plan!',
			{
				args: {
					premiumPlanName: getPlan( PLAN_PREMIUM ).getTitle(),
					businessPlanName: getPlan( PLAN_BUSINESS ).getTitle(),
				},
			}
		);

	if ( ! isThemeAllowed ) {
		switch ( THEME_TIERS[ themeTier.slug ].minimumUpsellPlan ) {
			case PLAN_PERSONAL:
				return translate(
					'Access this theme for FREE with a %(personalPlanName)s, %(premiumPlanName)s, or %(businessPlanName)s plan!',
					{
						args: {
							personalPlanName: getPlan( PLAN_PERSONAL ).getTitle(),
							premiumPlanName: getPlan( PLAN_PREMIUM ).getTitle(),
							businessPlanName: getPlan( PLAN_BUSINESS ).getTitle(),
						},
					}
				);
			case PLAN_PREMIUM:
				return premiumPlanTitle();
		}
	}

	if ( isBundledSoftwareSet && ! isExternallyManagedTheme ) {
		if ( ! bundleSettings ) {
			return translate( 'Access this theme with a %(businessPlanName)s plan!', {
				args: { businessPlanName: getPlan( PLAN_BUSINESS ).getTitle() },
			} );
		}

		const bundleName = bundleSettings.name;

		/* Translators: %(bundleName)s is the name of the bundle, sometimes represented as a product name. Examples: "WooCommerce" or "Special", %(businessPlanName)s is the short-form of the Business plan name.*/
		return translate( 'Access this %(bundleName)s theme with a %(businessPlanName)s plan!', {
			args: { bundleName, businessPlanName: getPlan( PLAN_BUSINESS ).getTitle() },
		} );
	} else if ( isExternallyManagedTheme && ! isMarketplaceThemeSubscribed ) {
		if ( ! isSiteEligibleForManagedExternalThemes ) {
			return translate( 'Upgrade to a %(businessPlanName)s plan and subscribe to this theme!', {
				args: { businessPlanName: getPlan( PLAN_BUSINESS ).getTitle() },
			} );
		}
		return translate( 'Subscribe to this theme!' );
	}

	return premiumPlanTitle();
};

class ThemeSheet extends Component {
	static displayName = 'ThemeSheet';

	static propTypes = {
		themeId: PropTypes.string,
		name: PropTypes.string,
		author: PropTypes.string,
		screenshot: PropTypes.string,
		screenshots: PropTypes.array,
		price: PropTypes.string,
		description: PropTypes.string,
		descriptionLong: PropTypes.oneOfType( [
			PropTypes.string,
			PropTypes.bool, // happens if no content: false
		] ),
		supportDocumentation: PropTypes.oneOfType( [
			PropTypes.string,
			PropTypes.bool, // happens if no content: false
		] ),
		download: PropTypes.string,
		taxonomies: PropTypes.object,
		stylesheet: PropTypes.string,
		retired: PropTypes.bool,
		// Connected props
		isLoggedIn: PropTypes.bool,
		siteCount: PropTypes.number,
		isActive: PropTypes.bool,
		isThemePurchased: PropTypes.bool,
		isJetpack: PropTypes.bool,
		isAtomic: PropTypes.bool,
		isStandaloneJetpack: PropTypes.bool,
		siteId: PropTypes.number,
		siteSlug: PropTypes.string,
		backPath: PropTypes.string,
		isWpcomTheme: PropTypes.bool,
		softLaunched: PropTypes.bool,
		defaultOption: PropTypes.shape( {
			label: PropTypes.string,
			action: PropTypes.func,
			getUrl: PropTypes.func,
		} ),
		secondaryOption: PropTypes.shape( {
			label: PropTypes.string,
			action: PropTypes.func,
			getUrl: PropTypes.func,
		} ),
		isExternallyManagedTheme: PropTypes.bool,
		isSiteEligibleForManagedExternalThemes: PropTypes.bool,
	};

	static defaultProps = {
		section: '',
	};

	/**
	 * Disabled button checks `isLoading` to determine if a the buttons should be disabled
	 * Its assigned to state to guarantee the initial state will be the same for SSR
	 */
	state = {
		disabledButton: true,
		showUnlockStyleUpgradeModal: false,
		isAtomicTransferCompleted: false,
		isReviewsModalVisible: false,
		isSiteSelectorModalVisible: false,
	};

	scrollToTop = () => {
		window.scroll( 0, 0 );
	};

	componentDidMount() {
		this.scrollToTop();

		const { syncActiveTheme, themeStartActivationSync, siteId, themeId } = this.props;
		if ( syncActiveTheme ) {
			themeStartActivationSync( siteId, themeId );
		}

		// eslint-disable-next-line react/no-did-mount-set-state
		this.setState( { disabledButton: this.isLoading() } );
	}

	componentDidUpdate( prevProps ) {
		if ( this.props.themeId !== prevProps.themeId ) {
			this.scrollToTop();
		}

		if ( this.state.disabledButton !== this.isLoading() ) {
			// eslint-disable-next-line react/no-did-update-set-state
			this.setState( { disabledButton: this.isLoading() } );
		}
	}

	isLoaded = () => {
		// We need to make sure the theme object has been loaded including full details
		// (and not just without, as would've been stored by the `<QueryThemes />` (plural!)
		// component used by the theme showcase's list view). However, these extra details
		// aren't present for non-wpcom themes.
		if ( ! this.props.isWpcomTheme ) {
			return !! this.props.name;
		}
		return !! this.props.screenshots;
	};

	isLoading = () => {
		const { isLoading, isThemeActivationSyncStarted } = this.props;
		const { isAtomicTransferCompleted } = this.state;
		return isLoading || ( isThemeActivationSyncStarted && ! isAtomicTransferCompleted );
	};

	// If a theme has been removed by a theme shop, then the theme will still exist and a8c will take over any support responsibilities.
	isRemoved = () =>
		!! this.props.taxonomies?.theme_status?.find( ( status ) => status.slug === 'removed' );

	onBeforeOptionAction = () => {
		this.props.setThemePreviewOptions(
			this.props.themeId,
			this.props.defaultOption,
			this.props.secondaryOption,
			{ styleVariation: this.getSelectedStyleVariation() }
		);
	};

	onButtonClick = ( event ) => {
		const { isLoggedIn, siteCount, siteId } = this.props;

		if ( shouldSelectSite( { isLoggedIn, siteCount, siteId } ) ) {
			event?.preventDefault();
			this.setState( { isSiteSelectorModalVisible: true } );
			return;
		}

		this.onBeforeOptionAction();
		this.props.defaultOption.action?.( this.props.themeId );
	};

	onUnlockStyleButtonClick = () => {
		this.props.recordTracksEvent(
			'calypso_theme_sheet_global_styles_gating_modal_show',
			this.getPremiumGlobalStylesEventProps()
		);

		this.setState( { showUnlockStyleUpgradeModal: true } );
	};

	onSecondaryButtonClick = () => {
		const { secondaryOption } = this.props;
		secondaryOption && secondaryOption.action && secondaryOption.action( this.props.themeId );
	};

	onStyleVariationClick = ( variation ) => {
		this.props.recordTracksEvent( 'calypso_theme_sheet_style_variation_click', {
			theme_name: this.props.themeId,
			style_variation: variation.slug,
		} );

		if ( typeof window !== 'undefined' ) {
			const params = new URLSearchParams( window.location.search );
			if ( variation.slug !== DEFAULT_GLOBAL_STYLES_VARIATION_SLUG ) {
				params.set( 'style_variation', variation.slug );
			} else {
				params.delete( 'style_variation' );
			}

			const paramsString = params.toString().length ? `?${ params.toString() }` : '';
			page( `${ window.location.pathname }${ paramsString }` );
		}
	};

	getValidSections = () => {
		const validSections = [];
		validSections.push( '' ); // Default section

		if ( ! this.props.isPremium && this.props.supportDocumentation ) {
			validSections.push( 'setup' );
		}

		validSections.push( 'support' );
		return validSections;
	};

	validateSection = ( section ) => {
		if ( this.getValidSections().indexOf( section ) === -1 ) {
			return this.getValidSections()[ 0 ];
		}
		return section;
	};

	trackFeatureClick = ( feature ) => {
		this.props.recordTracksEvent( 'calypso_theme_sheet_feature_click', {
			theme_name: this.props.themeId,
			feature,
		} );
	};

	trackButtonClick = ( context ) => {
		this.props.recordTracksEvent( 'calypso_theme_sheet_button_click', {
			theme_name: this.props.themeId,
			button_context: context,
		} );
	};

	trackContactUsClick = () => {
		this.trackButtonClick( 'help' );
	};

	trackThemeForumClick = () => {
		this.trackButtonClick( 'theme_forum' );
	};

	trackCssClick = () => {
		this.trackButtonClick( 'css_forum' );
	};

	trackNextThemeClick = () => {
		this.trackButtonClick( 'next_theme' );
	};

	renderBar = () => {
		const { author, name, translate, softLaunched } = this.props;

		const placeholder = <span className="theme__sheet-placeholder">loading.....</span>;
		const title = name || placeholder;
		const tag = author ? translate( 'by %(author)s', { args: { author: author } } ) : placeholder;

		return (
			<div className="theme__sheet-bar">
				<h1 className="theme__sheet-bar-title">
					{ title }
					{ softLaunched && (
						<span className="theme__sheet-bar-soft-launched">{ translate( 'A8C Only' ) }</span>
					) }
				</h1>
				<span className="theme__sheet-bar-tag">{ tag }</span>
			</div>
		);
	};

	getFullLengthScreenshot() {
		if ( this.isLoaded() ) {
			// Results are being returned with photon params like `?w=…`. This makes the photon
			// module abort and return null. Strip query string.
			return this.props.screenshots[ 0 ]?.replace( /\?.*/, '' );
		}
		return null;
	}

	previewAction = ( event, type, source ) => {
		const { demoUrl, isExternallyManagedTheme, isWpcomTheme, isLivePreviewSupported } = this.props;
		if ( event.altKey || event.ctrlKey || event.metaKey || event.shiftKey ) {
			return;
		}

		event.preventDefault();
		this.props.recordTracksEvent( 'calypso_theme_live_demo_preview_click', {
			theme: this.props.themeId,
			type,
			source,
			/**
			 * To see tracks as the UI changes depending on whether Live Preview is available or not.
			 * @see https://github.com/Automattic/wp-calypso/pull/80540
			 */
			has_live_preview_cta: isLivePreviewSupported,
		} );

		// The embed live demo works only for WP.com themes
		if ( isWpcomTheme && ! isExternallyManagedTheme ) {
			const { preview } = this.props.options;
			this.onBeforeOptionAction();
			return preview.action( this.props.themeId );
		}

		return window.open( demoUrl, '_blank', 'noreferrer,noopener' );
	};

	shouldRenderForStaging() {
		// isExternallyManagedTheme determines if a theme is paid or not
		const { isExternallyManagedTheme, isWpcomStaging } = this.props;
		return isExternallyManagedTheme && isWpcomStaging;
	}

	shouldRenderPreviewButton() {
		const { isWPForTeamsSite } = this.props;
		return (
			this.isThemeAvailable() &&
			! this.isThemeCurrentOne() &&
			! isWPForTeamsSite &&
			! this.shouldRenderForStaging()
		);
	}

	shouldRenderUnlockStyleButton() {
		const { defaultOption, selectedStyleVariationSlug, shouldLimitGlobalStyles, styleVariations } =
			this.props;
		const isNonDefaultStyleVariation = ! isDefaultGlobalStylesVariationSlug(
			selectedStyleVariationSlug
		);

		return (
			shouldLimitGlobalStyles &&
			defaultOption?.key === 'activate' &&
			styleVariations.length > 0 &&
			isNonDefaultStyleVariation
		);
	}

	isThemeCurrentOne() {
		return this.props.isActive;
	}

	isThemeAvailable() {
		const { demoUrl, retired } = this.props;
		return demoUrl && ! retired;
	}

	hasWpComThemeUpsellBanner() {
		const {
			hasUnlimitedPremiumThemes,
			isBundledSoftwareSet,
			isExternallyManagedTheme,
			isJetpack,
			isPremium,
			isVip,
			retired,
			isThemeAllowed,
			isSiteWooExpressFreeTrial,
			isThemeBundleWooCommerce,
		} = this.props;

		// Woo Express plans don't show banner on Woo themes.
		if ( isThemeBundleWooCommerce && isSiteWooExpressFreeTrial ) {
			return false;
		}

		// Show theme upsell banner on Simple sites.
		return (
			( ! isJetpack && isPremium && ! hasUnlimitedPremiumThemes && ! isVip && ! retired ) ||
			isBundledSoftwareSet ||
			! isThemeAllowed ||
			isExternallyManagedTheme
		);
	}

	hasWpOrgThemeUpsellBanner() {
		const { canUserUploadThemes, isAtomic, isJetpack, isWpcomTheme, siteId } = this.props;

		// Show theme upsell banner on Jetpack sites.
		return ! isAtomic && ! isWpcomTheme && ( ! siteId || ( ! isJetpack && ! canUserUploadThemes ) );
	}

	hasThemeUpsellBannerAtomic() {
		const { canUserUploadThemes, isAtomic, isPremium, hasUnlimitedPremiumThemes } = this.props;

		// Show theme upsell banner on Atomic sites.
		return isAtomic && isPremium && ! canUserUploadThemes && ! hasUnlimitedPremiumThemes;
	}

	renderScreenshot() {
		const { isWpcomTheme, name: themeName, demoUrl, translate } = this.props;
		const screenshotFull = isWpcomTheme ? this.getFullLengthScreenshot() : this.props.screenshot;
		const width = 735;
		// Photon may return null, allow fallbacks
		const photonSrc = screenshotFull && photon( screenshotFull, { width } );
		const img = screenshotFull && (
			<img
				alt={
					// translators: %s is the theme name. Eg Twenty Twenty.
					translate( 'Screenshot of the %(themeName)s theme', {
						args: { themeName },
					} )
				}
				className="theme__sheet-img"
				src={ photonSrc || screenshotFull }
				srcSet={ photonSrc && `${ photon( screenshotFull, { width, zoom: 2 } ) } 2x` }
			/>
		);

		if ( this.isThemeAvailable() && ! this.shouldRenderForStaging() ) {
			return (
				<a
					className="theme__sheet-screenshot is-active"
					href={ demoUrl }
					onClick={ ( e ) => {
						this.previewAction( e, 'screenshot', 'preview' );
					} }
					rel="noopener noreferrer"
				>
					{ this.shouldRenderPreviewButton() && (
						<Button className="theme__sheet-preview-demo-site">
							{ translate( 'Preview demo site' ) }
						</Button>
					) }
					{ img }
				</a>
			);
		}

		return (
			<div className="theme__sheet-screenshot">
				{ this.shouldRenderPreviewButton() && (
					<Button
						className="theme__sheet-preview-demo-site"
						onClick={ ( e ) => {
							this.previewAction( e, 'link', 'preview' );
						} }
					>
						{ translate( 'Preview demo site' ) }
					</Button>
				) }
				{ img }
			</div>
		);
	}

	renderWebPreview = () => {
		const { locale, siteSlug, stylesheet, styleVariations, themeId, translate } = this.props;
		const baseStyleVariation = styleVariations.find( ( style ) =>
			isDefaultGlobalStylesVariationSlug( style.slug )
		);
		const baseStyleVariationInlineCss = baseStyleVariation?.inline_css || '';
		const selectedStyleVariationInlineCss = this.getSelectedStyleVariation()?.inline_css || '';
		const url = getDesignPreviewUrl(
			{ slug: themeId, recipe: { stylesheet } },
			{ language: locale, viewport_unit_to_px: true }
		);

		// Normally, the ThemeWebPreview component will generate the iframe token via uuid.
		// Given that this page supports SSR, using uuid will cause hydration mismatch.
		// To avoid this, we pass a custom token that consists of the theme ID and user/anon ID.
		const iframeToken = themeId;
		if ( typeof document !== 'undefined' ) {
			iframeToken.concat( '-', getTracksAnonymousUserId() ?? siteSlug );
		}

		return (
			<div className="theme__sheet-web-preview">
				{ this.shouldRenderPreviewButton() && (
					<Button
						className="theme__sheet-preview-demo-site"
						onClick={ ( e ) => {
							this.previewAction( e, 'link', 'preview' );
						} }
					>
						{ translate( 'Preview demo site' ) }
					</Button>
				) }
				<ThemeWebPreview
					url={ url }
					inlineCss={ baseStyleVariationInlineCss + selectedStyleVariationInlineCss }
					iframeScaleRatio={ 0.5 }
					iframeToken={ iframeToken }
					isShowFrameBorder={ false }
					isShowDeviceSwitcher={ false }
					isFitHeight
				/>
			</div>
		);
	};

	renderSectionContent = () => {
		const { isPremium, isWpcomTheme, supportDocumentation } = this.props;

		return (
			<div className="theme__sheet-content">
				{ config.isEnabled( 'jitms' ) && this.props.siteSlug && (
					<AsyncLoad
						require="calypso/blocks/jitm"
						placeholder={ null }
						messagePath="calypso:theme:admin_notices"
					/>
				) }
				{ this.isLoaded() && (
					<>
						{ this.renderOverviewTab() }
						{ ! isPremium && supportDocumentation && this.renderSetupTab() }
						{ this.renderSupportTab() }
						{ isWpcomTheme && this.renderNextTheme() }
					</>
				) }
			</div>
		);
	};

	renderThemeBadge = () => {
		const { themeId, themeTier, themeType } = this.props;

		const isCommunityTheme = themeType === DOT_ORG_THEME;
		const isPartnerTheme = themeTier.slug === 'partner';
		const isSenseiOrWooCommerceTheme = themeType === BUNDLED_THEME;

		if ( ! isCommunityTheme && ! isPartnerTheme && ! isSenseiOrWooCommerceTheme ) {
			return null;
		}

		return (
			<ThemeTierBadge
				className="theme__sheet-main-info-type"
				showUpgradeBadge={ false }
				themeId={ themeId }
			/>
		);
	};

	renderHeader = () => {
		const {
			author,
			isLoggedIn,
			isLivePreviewSupported,
			isWPForTeamsSite,
			name,
			retired,
			siteId,
			softLaunched,
			themeId,
			translate,
		} = this.props;
		const placeholder = <span className="theme__sheet-placeholder">loading.....</span>;
		const title = name || placeholder;
		const tag = author ? translate( 'by %(author)s', { args: { author: author } } ) : placeholder;
		const shouldRenderButton =
			! retired &&
			! isWPForTeamsSite &&
			! this.shouldRenderForStaging() &&
			( ! this.hasWpOrgThemeUpsellBanner() || ! isLoggedIn );

		return (
			<div className="theme__sheet-header">
				<div className="theme__sheet-main">
					<div className="theme__sheet-main-info">
						<h1 className="theme__sheet-main-info-title">
							{ title }
							{ this.renderThemeBadge() }
							{ softLaunched && (
								<span className="theme__sheet-bar-soft-launched">{ translate( 'A8C Only' ) }</span>
							) }
						</h1>
						<span className="theme__sheet-main-info-tag">{ tag }</span>
					</div>
					<div className="theme__sheet-main-actions">
						{ shouldRenderButton &&
							( this.shouldRenderUnlockStyleButton()
								? this.renderUnlockStyleButton()
								: this.renderButton() ) }
						<LivePreviewButton
							siteId={ siteId }
							themeId={ themeId }
							onBeforeLivePreview={ this.onBeforeOptionAction }
						/>
						{ this.shouldRenderPreviewButton() && ! isLivePreviewSupported && (
							<Button
								onClick={ ( e ) => {
									this.previewAction( e, 'link', 'actions' );
								} }
							>
								{ translate( 'Demo site', {
									context: 'The button to open the demo site of individual theme',
								} ) }
							</Button>
						) }
					</div>
				</div>
				{ ! retired && this.renderStyleVariations() }
			</div>
		);
	};

	renderReviews = () => {
		const { name, themeId } = this.props;
		const { isReviewsModalVisible } = this.state;

		return (
			<div className="theme__sheet-reviews-summary">
				<ReviewsModal
					isVisible={ isReviewsModalVisible }
					onClose={ () => {
						this.setState( {
							isReviewsModalVisible: false,
						} );
					} }
					productName={ name }
					slug={ themeId }
					productType="theme"
				/>
				<ReviewsSummary
					slug={ themeId }
					productName={ name }
					productType="theme"
					onReviewsClick={ () => {
						this.setState( {
							isReviewsModalVisible: true,
						} );
					} }
				/>
			</div>
		);
	};

	renderStyleVariations = () => {
		const { isPremium, isThemePurchased, shouldLimitGlobalStyles, styleVariations } = this.props;

		const splitDefaultVariation =
			! this.props.isExternallyManagedTheme &&
			! this.props.isBundledSoftwareSet &&
			! isThemePurchased &&
			! isPremium &&
			shouldLimitGlobalStyles;

		const needsUpgrade = shouldLimitGlobalStyles || ( isPremium && ! isThemePurchased );

		return (
			styleVariations.length > 0 && (
				<ThemeStyleVariations
					description={ this.getStyleVariationDescription() }
					splitDefaultVariation={ splitDefaultVariation }
					selectedVariation={ this.getSelectedStyleVariation() }
					variations={ styleVariations }
					needsUpgrade={ needsUpgrade }
					onClick={ this.onStyleVariationClick }
				/>
			)
		);
	};

	renderDescription = () => {
		if ( this.props.descriptionLong ) {
			// eslint-disable-next-line react/no-danger
			return <div dangerouslySetInnerHTML={ { __html: this.props.descriptionLong } } />;
		}
		// description doesn't contain any formatting, so we don't need to dangerouslySetInnerHTML
		return <div>{ this.props.description }</div>;
	};

	renderStagingPaidThemeNotice = () => {
		if ( ! this.shouldRenderForStaging() ) {
			return null;
		}
		const { translate, productionSiteSlug, themeId } = this.props;

		let url = '';
		if ( productionSiteSlug ) {
			url = `/theme/${ themeId }/${ productionSiteSlug }`;
		}

		return (
			<Banner
				disableHref={ url === '' }
				icon="notice"
				href={ url }
				title={ translate( 'Partner themes cannot be purchased on staging sites' ) }
				description={ translate( 'Subscribe to this theme on your production site.' ) }
			/>
		);
	};

	renderNextTheme = () => {
		const { next, siteSlug, translate, locale, isLoggedIn } = this.props;
		const sitePart = siteSlug ? `/${ siteSlug }` : '';

		const nextThemeHref = localizeThemesPath(
			`/theme/${ next }${ sitePart }`,
			locale,
			! isLoggedIn
		);

		return (
			<div onClick={ this.trackNextThemeClick } role="presentation">
				<SectionHeader href={ nextThemeHref } label={ translate( 'Next theme' ) } />
			</div>
		);
	};

	renderOverviewTab = () => {
		const { download, isWpcomTheme, siteSlug, taxonomies, themeTier } = this.props;

		const showDownloadCard = download && 'free' === themeTier?.slug;

		return (
			<div>
				<Card className="theme__sheet-content">{ this.renderDescription() }</Card>
				<div className="theme__sheet-features">
					<ThemeFeaturesCard
						taxonomies={ taxonomies }
						siteSlug={ siteSlug }
						isWpcomTheme={ isWpcomTheme }
						onClick={ this.trackFeatureClick }
					/>
				</div>
				{ showDownloadCard && <ThemeDownloadCard href={ download } /> }
			</div>
		);
	};

	renderSetupTab = () => {
		/* eslint-disable react/no-danger */
		return (
			<div>
				<Card className="theme__sheet-content">
					<div dangerouslySetInnerHTML={ { __html: this.props.supportDocumentation } } />
				</Card>
			</div>
		);
		/* eslint-enable react/no-danger */
	};

	renderSupportContactUsCard = ( buttonCount ) => {
		return (
			<Card className="theme__sheet-card-support">
				<Gridicon icon="help-outline" size={ 48 } />
				<div className="theme__sheet-card-support-details">
					{ this.props.translate( 'Need extra help?' ) }
					<small>{ this.props.translate( 'Get in touch with our support team' ) }</small>
				</div>
				<Button
					primary={ buttonCount === 1 }
					href="/help/contact/"
					onClick={ this.trackContactUsClick }
				>
					{ this.props.translate( 'Contact us' ) }
				</Button>
			</Card>
		);
	};

	renderSupportThemeForumCard = ( buttonCount ) => {
		if ( ! this.props.forumUrl ) {
			return null;
		}

		const description = this.props.isWporg
			? this.props.translate( 'Get help from the theme author and WordPress.org community' )
			: this.props.translate( 'Get help from volunteers and staff' );

		return (
			<Card className="theme__sheet-card-support">
				<Gridicon icon="comment" size={ 48 } />
				<div className="theme__sheet-card-support-details">
					{ this.props.translate( 'Have a question about this theme?' ) }
					<small>{ description }</small>
				</div>
				<Button
					primary={ buttonCount === 1 }
					href={ localizeUrl( this.props.forumUrl ) }
					onClick={ this.trackThemeForumClick }
				>
					{ this.props.translate( 'Visit forum' ) }
				</Button>
			</Card>
		);
	};

	renderSupportTab = () => {
		const {
			author,
			isCurrentUserPaid,
			isStandaloneJetpack,
			forumUrl,
			isWpcomTheme,
			isLoggedIn,
			translate,
		} = this.props;
		let buttonCount = 1;
		let renderedTab = null;

		if ( isLoggedIn ) {
			renderedTab = (
				<div>
					{ isCurrentUserPaid &&
						( isWpcomTheme || author === 'Automattic' ) &&
						! isStandaloneJetpack &&
						this.renderSupportContactUsCard( buttonCount++ ) }
					{ forumUrl && this.renderSupportThemeForumCard( buttonCount++ ) }
				</div>
			);

			// No card has been rendered
			if ( buttonCount === 1 ) {
				renderedTab = (
					<Card className="theme__sheet-card-support">
						<Gridicon icon="notice-outline" size={ 48 } />
						<div className="theme__sheet-card-support-details">
							{ translate(
								'Help and support for this theme is not offered by WordPress.com. {{InlineSupportLink/}}',
								{
									components: {
										InlineSupportLink: (
											<InlineSupportLink supportContext="themes-unsupported" showIcon={ false } />
										),
									},
								}
							) }
							<small>
								{ translate( 'Contact the theme developer directly for help with this theme.' ) }
							</small>
						</div>
					</Card>
				);
			}
		} else {
			// Logged out
			renderedTab = (
				<Card className="theme__sheet-card-support">
					<Gridicon icon="help" size={ 48 } />
					<div className="theme__sheet-card-support-details">
						{ translate( 'Have a question about this theme?' ) }
						<small>
							{ translate( 'Pick this design and start a site with us, we can help!', {
								context: 'Logged out theme support message',
							} ) }
						</small>
					</div>
				</Card>
			);
		}

		return renderedTab;
	};

	getDefaultOptionLabel = () => {
		const {
			siteId,
			defaultOption,
			canInstallPlugins,
			isActive,
			isLoggedIn,
			isPremium,
			isThemePurchased,
			translate,
			isBundledSoftwareSet,
			isExternallyManagedTheme,
			isSiteEligibleForManagedExternalThemes,
			isMarketplaceThemeSubscribed,
			isThemeActivationSyncStarted,
			isThemeAllowed,
			isThemeInstalled,
			isSiteWooExpressFreeTrial,
			isThemeBundleWooCommerce,
		} = this.props;
		const { isAtomicTransferCompleted } = this.state;
		if ( isActive ) {
			// Customize site
			return (
				<span className="theme__sheet-customize-button">
					<Gridicon icon="external" />
					{ translate( 'Customize site' ) }
				</span>
			);
		} else if ( isLoggedIn && siteId ) {
			if (
				( ( ! isThemeAllowed || isPremium ) && ! isThemePurchased && ! isExternallyManagedTheme ) ||
				( isBundledSoftwareSet &&
					! canInstallPlugins &&
					! ( isSiteWooExpressFreeTrial && isThemeBundleWooCommerce ) )
			) {
				// upgrade plan
				return translate( 'Upgrade to activate', {
					comment:
						'label prompting user to upgrade the WordPress.com plan to activate a certain theme',
				} );
			} else if (
				isExternallyManagedTheme &&
				! isMarketplaceThemeSubscribed &&
				! isSiteEligibleForManagedExternalThemes
			) {
				return translate( 'Upgrade to subscribe' );
			} else if (
				isExternallyManagedTheme &&
				! isMarketplaceThemeSubscribed &&
				isSiteEligibleForManagedExternalThemes &&
				! isThemeInstalled
			) {
				return translate( 'Subscribe to activate' );
			} else if ( isThemeActivationSyncStarted && ! isAtomicTransferCompleted ) {
				return (
					<span className="theme__sheet-customize-button spin">
						<Gridicon icon="sync" />
						{ translate( 'Activate this design' ) }
					</span>
				);
			}
			// else: activate
			return translate( 'Activate this design' );
		}
		return defaultOption.label;
	};

	renderRetired = () => {
		const { translate, locale, isLoggedIn } = this.props;
		return (
			<div className="theme__sheet-content">
				<Card className="theme__retired-theme-message">
					<Gridicon icon="cross-circle" size={ 48 } />
					<div className="theme__retired-theme-message-details">
						<div className="theme__retired-theme-message-details-title">
							{ this.props.translate( 'This theme is retired' ) }
							<InlineSupportLink supportContext="themes-retired" showText={ false } />
						</div>
						<div>
							{ this.props.translate(
								'We invite you to try out a newer theme; start by browsing our WordPress theme directory.'
							) }
						</div>
					</div>
					<Button primary={ true } href={ localizeThemesPath( '/themes/', locale, ! isLoggedIn ) }>
						{ translate( 'See all themes' ) }
					</Button>
				</Card>

				{ this.isRemoved() && (
					<Card>
						<p>
							{ this.props.translate(
								'This theme has been renamed to reflect that support for it is now provided directly by WordPress.com. The theme will continue to work as before.'
							) }
						</p>
					</Card>
				) }
				<div className="theme__sheet-footer-line">
					<Gridicon icon="my-sites" />
				</div>
			</div>
		);
	};

	renderButton = () => {
		const { getUrl, key } = this.props.defaultOption;
		const label = this.getDefaultOptionLabel();
		const placeholder = <span className="theme__sheet-button-placeholder">loading......</span>;
		const {
			isActive,
			isExternallyManagedTheme,
			isLoggedIn,
			tabFilter,
			tier,
			selectedStyleVariationSlug: styleVariationSlug,
			themeType,
			siteCount,
			siteId,
			themeTier,
		} = this.props;

		return (
			<Button
				className="theme__sheet-primary-button"
				href={
					getUrl &&
					( key === 'customize' || ! isExternallyManagedTheme || ! isLoggedIn || ! siteId )
						? getUrl( this.props.themeId, {
								tabFilter,
								tierFilter: tier,
								styleVariationSlug,
								themeTier,
						  } )
						: null
				}
				onClick={ ( event ) => {
					const action = shouldSelectSite( { isLoggedIn, siteCount, siteId } ) ? 'selectSite' : key;

					this.props.recordTracksEvent( 'calypso_theme_sheet_primary_button_click', {
						theme: this.props.themeId,
						theme_type: themeType,
						theme_tier: themeTier?.slug,
						...( action && { action } ),
					} );

					this.onButtonClick( event );
				} }
				primary
				disabled={ this.state.disabledButton }
				target={ isActive ? '_blank' : null }
			>
				{ this.isLoaded() ? label : placeholder }
			</Button>
		);
	};

	renderUnlockStyleButton = () => {
		return (
			<Button
				className="theme__sheet-primary-button"
				primary
				disabled={ this.isLoading() }
				onClick={ this.onUnlockStyleButtonClick }
			>
				{ this.getDefaultOptionLabel() }
			</Button>
		);
	};

	getSelectedStyleVariation = () => {
		const { selectedStyleVariationSlug, styleVariations } = this.props;
		return styleVariations.find( ( variation ) => variation.slug === selectedStyleVariationSlug );
	};

	goBack = () => {
		const { backPath, locale, isLoggedIn, themeId } = this.props;
		this.props.recordTracksEvent( 'calypso_theme_sheet_back_click', { theme_name: themeId } );

		// Use history back when coming from customize your store screen.
		const urlParams = new URLSearchParams( window.location.search );
		if ( urlParams.has( 'from', 'customize-store' ) && window.history.length > 1 ) {
			window.history.back();
			return;
		}

		page( localizeThemesPath( backPath, locale, ! isLoggedIn ) );
	};

	getBannerUpsellTitle = () => <BannerUpsellTitle { ...this.props } />;

	getBannerUpsellDescription = () => <BannerUpsellDescription { ...this.props } />;

	getPremiumGlobalStylesEventProps = () => {
		const { selectedStyleVariationSlug, themeId } = this.props;
		return {
			theme_name: themeId,
			style_variation: selectedStyleVariationSlug ?? DEFAULT_GLOBAL_STYLES_VARIATION_SLUG,
		};
	};

	onPremiumGlobalStylesUpgradeModalCheckout = () => {
		this.props.recordTracksEvent(
			'calypso_theme_sheet_global_styles_gating_modal_checkout_button_click',
			this.getPremiumGlobalStylesEventProps()
		);

		const params = new URLSearchParams();
		params.append( 'redirect_to', window.location.href.replace( window.location.origin, '' ) );

		this.setState( { showUnlockStyleUpgradeModal: false } );
		page( `/checkout/${ this.props.siteSlug || '' }/premium?${ params.toString() }` );
	};

	onPremiumGlobalStylesUpgradeModalTryStyle = () => {
		this.props.recordTracksEvent(
			'calypso_theme_sheet_global_styles_gating_modal_try_button_click',
			this.getPremiumGlobalStylesEventProps()
		);

		this.setState( { showUnlockStyleUpgradeModal: false } );
		this.onButtonClick();
	};

	onPremiumGlobalStylesUpgradeModalClose = () => {
		this.props.recordTracksEvent(
			'calypso_theme_sheet_global_styles_gating_modal_close_button_click',
			this.getPremiumGlobalStylesEventProps()
		);

		this.setState( { showUnlockStyleUpgradeModal: false } );
	};

	onAtomicThemeActive = () => {
		if ( ! this.state.isAtomicTransferCompleted ) {
			this.setState( {
				isAtomicTransferCompleted: true,
			} );

			const { isAtomic, siteSlug, themeId } = this.props;
			if ( ! isAtomic ) {
				const newSiteSlug = siteSlug.replace( /\b.wordpress.com/, '.wpcomstaging.com' );
				return page( `/theme/${ themeId }/${ newSiteSlug }` );
			}
		}
	};

	onAtomicThemeActiveFailure = ( message ) => {
		this.props.errorNotice( message );
	};

	getStyleVariationDescription = () => {
		const { defaultOption, isActive, isWpcomTheme, themeId, shouldLimitGlobalStyles, translate } =
			this.props;
		if ( isActive && defaultOption.getUrl ) {
			return translate( 'Open the {{a}}site editor{{/a}} to change your site’s style.', {
				components: {
					a: (
						<a href={ defaultOption.getUrl( themeId ) } target="_blank" rel="noopener noreferrer" />
					),
				},
			} );
		}

		if ( ! shouldLimitGlobalStyles || isWpcomTheme ) {
			return;
		}

		return translate( 'Additional styles require the %(businessPlanName)s plan or higher.', {
			args: { businessPlanName: getPlan( PLAN_BUSINESS ).getTitle() },
		} );
	};

	handleAddReview = () => {
		this.setState( { showReviewModal: true } );
	};
	handleCloseReviewModal = () => {
		this.setState( { showReviewModal: false } );
	};

	renderSheet = () => {
		const section = this.validateSection( this.props.section );
		const {
			themeId,
			siteCount,
			siteId,
			siteSlug,
			retired,
			isBundledSoftwareSet,
			translate,
			isLoggedIn,
			isPremium,
			isThemeInstalled,
			isThemePurchased,
			isSiteBundleEligible,
			isSiteEligibleForManagedExternalThemes,
			isMarketplaceThemeSubscribed,
			isExternallyManagedTheme,
			isThemeActivationSyncStarted,
			isWpcomTheme,
			isThemeAllowed,
			successNotice: showSuccessNotice,
			themeTier,
		} = this.props;
		const analyticsPath = `/theme/${ themeId }${ section ? '/' + section : '' }${
			siteId ? '/:site' : ''
		}`;
		const analyticsPageTitle = `Themes > Details Sheet${
			section ? ' > ' + titlecase( section ) : ''
		}${ siteId ? ' > Site' : '' }`;

		let plansUrl = '';
		if ( ! isLoggedIn ) {
			plansUrl = localizeUrl( 'https://wordpress.com/pricing' );
		} else if ( siteSlug ) {
			const redirectTo = `/theme/${ themeId }${ section ? '/' + section : '' }/${ siteSlug }`;
			let plan;
			if ( ! isThemeAllowed ) {
				plan = THEME_TIERS[ themeTier.slug ].minimumUpsellPlan;
			} else {
				plan = isExternallyManagedTheme || isBundledSoftwareSet ? PLAN_BUSINESS : PLAN_PREMIUM;
			}

			// @TODO we should add a new feature for personal plan themes or what we agree on.
			const feature =
				PLAN_PREMIUM === plan
					? WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED
					: FEATURE_UPLOAD_THEMES_PLUGINS;

			plansUrl = `/plans/${ siteSlug }/?plan=${ plan }&feature=${ feature }&redirect_to=${ redirectTo }`;
		} else {
			plansUrl =
				isExternallyManagedTheme || isBundledSoftwareSet ? '/start/business' : '/start/premium';
		}

		const launchPricing = () => window.open( plansUrl, '_blank' );

		const { canonicalUrl, description, name: themeName, seo_title, seo_description } = this.props;

		const title = seo_title
			? seo_title
			: translate( '%(themeName)s Theme', {
					args: { themeName },
			  } );

		const metas = [
			{ property: 'og:title', content: title },
			{ property: 'og:url', content: canonicalUrl },
			{ property: 'og:image', content: this.props.screenshot },
			{ property: 'og:type', content: 'website' },
			{ property: 'og:site_name', content: 'WordPress.com' },
		];

		if ( seo_description || description ) {
			metas.push( {
				name: 'description',
				property: 'og:description',
				content: decodeEntities( seo_description || description ),
			} );
		}

		if ( this.props.retired ) {
			metas.push( {
				name: 'robots',
				content: 'noindex',
			} );
		}

		let pageUpsellBanner;
		let previewUpsellBanner;

		// Show theme upsell banner on Simple sites.
		const hasWpComThemeUpsellBanner =
			this.hasWpComThemeUpsellBanner() && ! this.shouldRenderForStaging();
		// Show theme upsell banner on Jetpack sites.
		const hasWpOrgThemeUpsellBanner =
			this.hasWpOrgThemeUpsellBanner() && ! this.shouldRenderForStaging();
		// Show theme upsell banner on Atomic sites.
		const hasThemeUpsellBannerAtomic =
			this.hasThemeUpsellBannerAtomic() && ! this.shouldRenderForStaging();

		const hasUpsellBanner =
			hasWpComThemeUpsellBanner || hasWpOrgThemeUpsellBanner || hasThemeUpsellBannerAtomic;

		let onClick = null;

		if (
			shouldSelectSite( { isLoggedIn, siteCount, siteId } ) ||
			( isExternallyManagedTheme && isLoggedIn && siteId )
		) {
			onClick = this.onButtonClick;
		} else if ( ! isLoggedIn ) {
			onClick = launchPricing;
		}

		const upsellNudgeClasses = classNames( 'theme__page-upsell-banner', {
			'theme__page-upsell-disabled': this.state.disabledButton,
		} );

		if ( hasWpComThemeUpsellBanner ) {
			const forceDisplay =
				( isPremium && ! isThemePurchased ) ||
				( isBundledSoftwareSet && ! isSiteBundleEligible ) ||
				! isThemeAllowed ||
				( isExternallyManagedTheme &&
					! isThemeInstalled &&
					( ! isMarketplaceThemeSubscribed || ! isSiteEligibleForManagedExternalThemes ) );

			let upsellNudgePlan;
			if ( ! isThemeAllowed ) {
				upsellNudgePlan = THEME_TIERS[ themeTier.slug ].minimumUpsellPlan;
			} else {
				upsellNudgePlan =
					isExternallyManagedTheme || isBundledSoftwareSet ? PLAN_BUSINESS : PLAN_PREMIUM;
			}
			const upsellNudgeFeature = themeTier?.feature;

			pageUpsellBanner = (
				<UpsellNudge
					plan={ upsellNudgePlan }
					className={ upsellNudgeClasses }
					title={ this.getBannerUpsellTitle() }
					description={ preventWidows( this.getBannerUpsellDescription() ) }
					event="themes_plan_particular_free_with_plan"
					feature={ upsellNudgeFeature }
					forceHref={ onClick === null }
					disableHref={ onClick !== null }
					onClick={ null === onClick ? noop : onClick }
					href={ plansUrl }
					showIcon={ true }
					forceDisplay={ forceDisplay }
					displayAsLink={ onClick !== null }
					tracksClickProperties={ { theme_tier: themeTier?.slug } }
				/>
			);
		}

		if ( hasWpOrgThemeUpsellBanner || hasThemeUpsellBannerAtomic ) {
			const themeInstallationURL = `/marketplace/theme/${ themeId }/install/${ siteSlug }`;
			const onThemeUpsellPlanClick = ( event ) => {
				if ( shouldSelectSite( { isLoggedIn, siteCount, siteId } ) ) {
					event?.preventDefault();
					this.setState( { isSiteSelectorModalVisible: true } );
					return;
				}

				this.props.setProductToBeInstalled( themeId, siteSlug );
			};
			const disableHref = shouldSelectSite( { isLoggedIn, siteCount, siteId } );
			pageUpsellBanner = (
				<UpsellNudge
					plan={ PLAN_BUSINESS }
					className="theme__page-upsell-banner"
					onClick={ onThemeUpsellPlanClick }
					title={ translate( 'Access this third-party theme with the %(businessPlanName)s plan!', {
						args: { businessPlanName: getPlan( PLAN_BUSINESS ).getTitle() },
					} ) }
					description={ preventWidows(
						translate(
							'Instantly unlock thousands of different themes and install your own when you upgrade to the %(businessPlanName)s plan.',
							{ args: { businessPlanName: getPlan( PLAN_BUSINESS ).getTitle() } }
						)
					) }
					forceHref={ ! disableHref }
					disableHref={ disableHref }
					feature={ FEATURE_UPLOAD_THEMES }
					forceDisplay
					href={
						siteId
							? `/checkout/${ siteSlug }/business?redirect_to=${ themeInstallationURL }`
							: localizeUrl( 'https://wordpress.com/start/business' )
					}
					showIcon
					event="theme_upsell_plan_click"
					tracksClickName="calypso_theme_upsell_plan_click"
					tracksClickProperties={ {
						theme_id: themeId,
						theme_name: themeName,
						theme_tier: themeTier?.slug,
					} }
				/>
			);
		}

		if ( hasUpsellBanner ) {
			previewUpsellBanner = cloneElement( pageUpsellBanner, {
				className: 'theme__preview-upsell-banner',
			} );
		}

		const isRemoved = this.isRemoved();

		const className = classNames( 'theme__sheet', {
			'is-with-upsell-banner': hasUpsellBanner,
		} );
		const columnsClassName = classNames( 'theme__sheet-columns', {
			'is-removed': isRemoved,
		} );

		return (
			<Main className={ className }>
				<QueryCanonicalTheme themeId={ this.props.themeId } siteId={ siteId } />
				<QueryProductsList />
				<QueryUserPurchases />
				{
					siteId && (
						<QuerySitePurchases siteId={ siteId } />
					) /* TODO: Make QuerySitePurchases handle falsey siteId */
				}
				<QuerySitePlans siteId={ siteId } />
				<DocumentHead title={ title } meta={ metas } />
				<PageViewTracker
					path={ analyticsPath }
					title={ analyticsPageTitle }
					properties={ { is_logged_in: isLoggedIn } }
				/>
				<AsyncLoad require="calypso/components/global-notices" placeholder={ null } id="notices" />
				{
					siteId && (
						<QueryActiveTheme siteId={ siteId } />
					) /* TODO: Make QueryActiveTheme handle falsey siteId */
				}
				<ThemeSiteSelectorModal
					isOpen={ this.state.isSiteSelectorModalVisible }
					onClose={ ( args ) => {
						this.setState( { isSiteSelectorModalVisible: false } );

						if ( args?.siteTitle ) {
							showSuccessNotice(
								translate( 'You have selected the site {{strong}}%(siteTitle)s{{/strong}}.', {
									args: { siteTitle: args.siteTitle },
									components: { strong: <strong /> },
									comment:
										'On the theme details page, notification shown to the user after they choose one of their sites to activate the selected theme',
								} ),
								{
									button: translate( 'Choose a different site', {
										comment:
											'On the theme details page, notification shown to the user offering them the option to choose a different site before activating the selected theme',
									} ),
									onClick: () => this.setState( { isSiteSelectorModalVisible: true } ),
								}
							);
						}
					} }
				/>
				<ThanksModal source="details" themeId={ this.props.themeId } />
				<ActivationModal source="details" />
				<div className="theme__sheet-action-bar-container">
					<HeaderCake
						className="theme__sheet-action-bar"
						backText={ translate( 'Back to themes' ) }
						onClick={ this.goBack }
						alwaysShowBackText
					/>
				</div>
				<div className={ columnsClassName }>
					<div className="theme__sheet-column-header">
						{ pageUpsellBanner }
						{ this.renderStagingPaidThemeNotice() }
						{ this.renderHeader() }
						{ this.renderReviews() }
					</div>
					<div className="theme__sheet-column-left">
						{ ! retired && this.renderSectionContent( section ) }
						{ retired && this.renderRetired() }
					</div>
					{ ! isRemoved && (
						<div className="theme__sheet-column-right">
							{ isWpcomTheme && ! isExternallyManagedTheme
								? this.renderWebPreview()
								: this.renderScreenshot() }
						</div>
					) }
				</div>
				<ThemePreview belowToolbar={ previewUpsellBanner } />
				<PremiumGlobalStylesUpgradeModal
					checkout={ this.onPremiumGlobalStylesUpgradeModalCheckout }
					tryStyle={ this.onPremiumGlobalStylesUpgradeModalTryStyle }
					closeModal={ this.onPremiumGlobalStylesUpgradeModalClose }
					isOpen={ this.state.showUnlockStyleUpgradeModal }
				/>
				<PerformanceTrackerStop />
				{ isThemeActivationSyncStarted && (
					<SyncActiveTheme
						siteId={ siteId }
						themeId={ themeId }
						onAtomicThemeActive={ this.onAtomicThemeActive }
						onFailure={ this.onAtomicThemeActiveFailure }
					/>
				) }
				<EligibilityWarningModal />
			</Main>
		);
	};

	render() {
		if ( this.props.error ) {
			return <ThemeNotFoundError />;
		}

		return this.renderSheet();
	}
}

const withSiteGlobalStylesStatus = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const { siteId } = props;
		const { shouldLimitGlobalStyles } = useSiteGlobalStylesStatus( siteId );

		return <Wrapped { ...props } shouldLimitGlobalStyles={ shouldLimitGlobalStyles } />;
	},
	'withSiteGlobalStylesStatus'
);

const ConnectedThemeSheet = connectOptions( ThemeSheet );

const ThemeSheetWithOptions = ( props ) => {
	const {
		siteId,
		canInstallPlugins,
		isActive,
		isLoggedIn,
		isPremium,
		isThemePurchased,
		isStandaloneJetpack,
		demoUrl,
		showTryAndCustomize,
		isThemeInstalled,
		isBundledSoftwareSet,
		isExternallyManagedTheme,
		isSiteEligibleForManagedExternalThemes,
		isMarketplaceThemeSubscribed,
		isSiteWooExpressFreeTrial,
		isThemeBundleWooCommerce,
	} = props;
	const isThemeAllowed = useIsThemeAllowedOnSite( siteId, props.themeId );

	let defaultOption;
	let secondaryOption = 'tryandcustomize';
	const needsJetpackPlanUpgrade = isStandaloneJetpack && isPremium && ! isThemePurchased;

	if ( ! showTryAndCustomize ) {
		secondaryOption = null;
	}

	if ( ! isLoggedIn || ! siteId ) {
		defaultOption = 'signup';
		secondaryOption = null;
	} else if ( isActive ) {
		defaultOption = 'customize';
	} else if ( needsJetpackPlanUpgrade ) {
		defaultOption = 'upgradePlan';
	} else if ( isExternallyManagedTheme && ! isSiteEligibleForManagedExternalThemes ) {
		defaultOption = 'upgradePlanForExternallyManagedThemes';
	} else if (
		isExternallyManagedTheme &&
		isSiteEligibleForManagedExternalThemes &&
		! isMarketplaceThemeSubscribed &&
		! isThemeInstalled
	) {
		defaultOption = 'subscribe';
	} else if ( ( isPremium && ! isThemePurchased && ! isBundledSoftwareSet ) || ! isThemeAllowed ) {
		defaultOption = 'purchase';
	} else if (
		! canInstallPlugins &&
		isBundledSoftwareSet &&
		! ( isSiteWooExpressFreeTrial && isThemeBundleWooCommerce )
	) {
		defaultOption = 'upgradePlanForBundledThemes';
	} else {
		defaultOption = 'activate';
	}

	const themeTier = useThemeTierForTheme( props.themeId );

	return (
		<ConnectedThemeSheet
			{ ...props }
			themeTier={ themeTier }
			isThemeAllowed={ isThemeAllowed }
			demo_uri={ demoUrl }
			siteId={ siteId }
			defaultOption={ defaultOption }
			secondaryOption={ secondaryOption }
			source="showcase-sheet"
		/>
	);
};

export default connect(
	( state, { id } ) => {
		const themeId = id;
		const siteId = getSelectedSiteId( state );
		const siteSlug = getSiteSlug( state, siteId );
		const isWpcomTheme = isThemeWpcom( state, themeId );
		const backPath = getBackPath( state );
		const isCurrentUserPaid = isUserPaid( state );
		const theme = getCanonicalTheme( state, siteId, themeId );
		const error = theme
			? false
			: getThemeRequestErrors( state, themeId, 'wpcom' ) ||
			  getThemeRequestErrors( state, themeId, siteId );
		const englishUrl = 'https://wordpress.com' + getThemeDetailsUrl( state, themeId );

		const isAtomic = isSiteAutomatedTransfer( state, siteId );
		const isWpcomStaging = isSiteWpcomStaging( state, siteId );
		const productionSite = getProductionSiteForWpcomStaging( state, siteId );
		const productionSiteSlug = getSiteSlug( state, productionSite?.ID );
		const isJetpack = isJetpackSite( state, siteId );
		const isStandaloneJetpack = isJetpack && ! isAtomic;

		const isExternallyManagedTheme = getIsExternallyManagedTheme( state, theme?.id );
		const isLoading =
			getIsLoadingCart( state ) ||
			( isExternallyManagedTheme && Object.values( getProductsList( state ) ).length === 0 );

		const isMarketplaceThemeSubscribed =
			isExternallyManagedTheme && getIsMarketplaceThemeSubscribed( state, theme?.id, siteId );

		const isLivePreviewSupported = getIsLivePreviewSupported( state, themeId, siteId );

		const queryArgs = getCurrentQueryArguments( state );

		return {
			...theme,
			themeId,
			price: getPremiumThemePrice( state, themeId, siteId ),
			error,
			siteId,
			siteSlug,
			backPath,
			tabFilter: queryArgs?.tab_filter,
			isCurrentUserPaid,
			isWpcomTheme,
			isWporg: isWporgTheme( state, themeId ),
			isWpcomStaging,
			productionSiteSlug,
			isLoggedIn: isUserLoggedIn( state ),
			siteCount: getCurrentUserSiteCount( state ),
			isActive: isThemeActive( state, themeId, siteId ),
			isJetpack,
			isAtomic,
			isStandaloneJetpack,
			isVip: isVipSite( state, siteId ),
			isPremium: isThemePremium( state, themeId ),
			isThemeInstalled: !! getTheme( state, siteId, themeId ),
			isThemePurchased: isPremiumThemeAvailable( state, themeId, siteId ),
			isBundledSoftwareSet: doesThemeBundleSoftwareSet( state, themeId ),
			isThemeBundleWooCommerce: isThemeWooCommerce( state, themeId ),
			isSiteWooExpressFreeTrial: isSiteOnECommerceTrial( state, siteId ),
			isSiteBundleEligible: isSiteEligibleForBundledSoftware( state, siteId ),
			forumUrl: getThemeForumUrl( state, themeId, siteId ),
			hasUnlimitedPremiumThemes: siteHasFeature(
				state,
				siteId,
				WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED
			),
			showTryAndCustomize: shouldShowTryAndCustomize( state, themeId, siteId ),
			canInstallPlugins: siteHasFeature( state, siteId, WPCOM_FEATURES_INSTALL_PLUGINS ),
			canUserUploadThemes: siteHasFeature( state, siteId, FEATURE_UPLOAD_THEMES ),
			// Remove the trailing slash because the page URL doesn't have one either.
			canonicalUrl: localizeUrl( englishUrl, getLocaleSlug(), false ).replace( /\/$/, '' ),
			demoUrl: getThemeDemoUrl( state, themeId, siteId ),
			isWPForTeamsSite: isSiteWPForTeams( state, siteId ),
			softLaunched: theme?.soft_launched,
			styleVariations: theme?.style_variations || [],
			selectedStyleVariationSlug: queryArgs?.style_variation,
			isExternallyManagedTheme,
			isSiteEligibleForManagedExternalThemes: getIsSiteEligibleForManagedExternalThemes(
				state,
				siteId
			),
			isLoading,
			isMarketplaceThemeSubscribed,
			isThemeActivationSyncStarted: getIsThemeActivationSyncStarted( state, siteId, themeId ),
			isLivePreviewSupported,
			themeType: getThemeType( state, themeId ),
		};
	},
	{
		setThemePreviewOptions,
		successNotice,
		recordTracksEvent,
		themeStartActivationSync: themeStartActivationSyncAction,
		errorNotice,
		setProductToBeInstalled: productToBeInstalled,
	}
)( withSiteGlobalStylesStatus( localize( ThemeSheetWithOptions ) ) );
