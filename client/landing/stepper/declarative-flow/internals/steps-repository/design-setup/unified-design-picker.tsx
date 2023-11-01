import { PLAN_BUSINESS_MONTHLY, WPCOM_FEATURES_PREMIUM_THEMES } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import {
	Onboard,
	updateLaunchpadSettings,
	useStarterDesignsQuery,
	getThemeIdFromStylesheet,
} from '@automattic/data-stores';
import {
	UnifiedDesignPicker,
	useCategorizationFromApi,
	getDesignPreviewUrl,
	isAssemblerDesign,
	isAssemblerSupported,
} from '@automattic/design-picker';
import { useLocale } from '@automattic/i18n-utils';
import { StepContainer, DESIGN_FIRST_FLOW } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState, useEffect, useMemo } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import QueryEligibility from 'calypso/components/data/query-atat-eligibility';
import { useQueryProductsList } from 'calypso/components/data/query-products-list';
import { useQuerySiteFeatures } from 'calypso/components/data/query-site-features';
import { useQuerySitePurchases } from 'calypso/components/data/query-site-purchases';
import { useQueryTheme } from 'calypso/components/data/query-theme';
import { useQueryThemes } from 'calypso/components/data/query-themes';
import FormattedHeader from 'calypso/components/formatted-header';
import PremiumGlobalStylesUpgradeModal from 'calypso/components/premium-global-styles-upgrade-modal';
import ThemeTypeBadge from 'calypso/components/theme-type-badge';
import { ThemeUpgradeModal as UpgradeModal } from 'calypso/components/theme-upgrade-modal';
import { ActiveTheme } from 'calypso/data/themes/use-active-theme-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { urlToSlug } from 'calypso/lib/url';
import { marketplaceThemeBillingProductSlug } from 'calypso/my-sites/themes/helpers';
import { useDispatch as useReduxDispatch, useSelector } from 'calypso/state';
import { getEligibility } from 'calypso/state/automated-transfer/selectors';
import { getProductsByBillingSlug } from 'calypso/state/products-list/selectors';
import { hasPurchasedDomain } from 'calypso/state/purchases/selectors/has-purchased-domain';
import { useSiteGlobalStylesStatus } from 'calypso/state/sites/hooks/use-site-global-styles-status';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { setActiveTheme, activateOrInstallThenActivate } from 'calypso/state/themes/actions';
import {
	isMarketplaceThemeSubscribed as getIsMarketplaceThemeSubscribed,
	getTheme,
	isSiteEligibleForManagedExternalThemes,
} from 'calypso/state/themes/selectors';
import { isThemePurchased } from 'calypso/state/themes/selectors/is-theme-purchased';
import { getPreferredBillingCycleProductSlug } from 'calypso/state/themes/theme-utils';
import useCheckout from '../../../../hooks/use-checkout';
import { useIsPluginBundleEligible } from '../../../../hooks/use-is-plugin-bundle-eligible';
import { useQuery } from '../../../../hooks/use-query';
import { useSiteData } from '../../../../hooks/use-site-data';
import { ONBOARD_STORE, SITE_STORE } from '../../../../stores';
import {
	getDesignEventProps,
	getDesignTypeProps,
	recordPreviewedDesign,
	recordSelectedDesign,
	getVirtualDesignProps,
} from '../../analytics/record-design';
import StepperLoader from '../../components/stepper-loader';
import { getCategorizationOptions } from './categories';
import { STEP_NAME } from './constants';
import DesignPickerDesignTitle from './design-picker-design-title';
import { EligibilityWarningsModal } from './eligibility-warnings-modal';
import useRecipe from './hooks/use-recipe';
import getThemeIdFromDesign from './utils/get-theme-id-from-design';
import type { Step, ProvidedDependencies } from '../../types';
import './style.scss';
import type {
	OnboardSelect,
	SiteSelect,
	StarterDesigns,
	GlobalStyles,
} from '@automattic/data-stores';
import type { Design, StyleVariation } from '@automattic/design-picker';
import type { GlobalStylesObject } from '@automattic/global-styles';
import type { AnyAction } from 'redux';
import type { ThunkAction } from 'redux-thunk';
const SiteIntent = Onboard.SiteIntent;

const UnifiedDesignPickerStep: Step = ( { navigation, flow, stepName } ) => {
	const queryParams = useQuery();
	const { goBack, submit, exitFlow } = navigation;

	const reduxDispatch = useReduxDispatch();

	const translate = useTranslate();
	const locale = useLocale();

	const intent = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getIntent(),
		[]
	);

	const { site, siteSlug, siteSlugOrId } = useSiteData();
	const siteTitle = site?.name;
	const siteDescription = site?.description;
	const { shouldLimitGlobalStyles } = useSiteGlobalStylesStatus( site?.ID );
	const isDesignFirstFlow =
		flow === DESIGN_FIRST_FLOW || queryParams.get( 'flowToReturnTo' ) === DESIGN_FIRST_FLOW;

	const wpcomSiteSlug = useSelector( ( state ) => getSiteSlug( state, site?.ID ) );
	const didPurchaseDomain = useSelector(
		( state ) => site?.ID && hasPurchasedDomain( state, site.ID )
	);

	// The design-first flow put the checkout at the last step, so we cannot show any upsell modal.
	// Therefore, we need to hide any feature that needs to check out right away, e.g.: Premium theme.
	// But maybe we can enable the global styles since it's gated under the Premium plan.
	const disableCheckoutImmediately = isDesignFirstFlow;
	const [ shouldHideActionButtons, setShouldHideActionButtons ] = useState( false );
	const [ showEligibility, setShowEligibility ] = useState( false );

	const { goToCheckout } = useCheckout();

	const isJetpack = useSelect(
		( select ) => site && ( select( SITE_STORE ) as SiteSelect ).isJetpackSite( site.ID ),
		[ site ]
	);
	const isAtomic = useSelect(
		( select ) => site && ( select( SITE_STORE ) as SiteSelect ).isSiteAtomic( site.ID ),
		[ site ]
	);
	useEffect( () => {
		if ( isAtomic ) {
			// TODO: move this logic from this step to the flow(s). See: https://wp.me/pdDR7T-KR
			exitFlow?.( `/site-editor/${ siteSlugOrId }` );
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ isAtomic ] );

	const isPremiumThemeAvailable = Boolean(
		useSelect(
			( select ) =>
				site &&
				( select( SITE_STORE ) as SiteSelect ).siteHasFeature(
					site.ID,
					WPCOM_FEATURES_PREMIUM_THEMES
				),
			[ site ]
		)
	);

	// ********** Logic for fetching designs
	const selectStarterDesigns = ( allDesigns: StarterDesigns ) => {
		if ( disableCheckoutImmediately ) {
			allDesigns.designs = allDesigns.designs
				.filter(
					( design ) =>
						! (
							design.is_premium ||
							design.is_externally_managed ||
							design.is_bundled_with_woo_commerce
						)
				)
				.map( ( design ) => {
					design.style_variations = [];
					return design;
				} );
		}

		return allDesigns;
	};

	const { data: allDesigns, isLoading: isLoadingDesigns } = useStarterDesignsQuery(
		{
			seed: siteSlugOrId ? String( siteSlugOrId ) : undefined,
			_locale: locale,
		},
		{
			enabled: true,
			select: selectStarterDesigns,
		}
	);

	const designs = useMemo( () => allDesigns?.designs ?? [], [ allDesigns?.designs ] );
	const hasTrackedView = useRef( false );
	useEffect( () => {
		if ( ! hasTrackedView.current && designs.length > 0 ) {
			hasTrackedView.current = true;
			recordTracksEvent( 'calypso_signup_unified_design_picker_view' );
		}
	}, [ hasTrackedView, designs ] );

	const categorizationOptions = getCategorizationOptions( intent );
	const categorization = useCategorizationFromApi(
		allDesigns?.filters?.subject || {},
		categorizationOptions
	);

	// ********** Logic for selecting a design and style variation
	const {
		isPreviewingDesign,
		selectedDesign,
		selectedStyleVariation,
		selectedColorVariation,
		selectedFontVariation,
		numOfSelectedGlobalStyles,
		globalStyles,
		setSelectedDesign,
		previewDesign,
		previewDesignVariation,
		setSelectedColorVariation,
		setSelectedFontVariation,
		setGlobalStyles,
		resetPreview,
	} = useRecipe(
		site?.ID,
		allDesigns,
		pickDesign,
		pickUnlistedDesign,
		recordPreviewDesign,
		recordPreviewStyleVariation,
		disableCheckoutImmediately
	);

	const shouldUnlockGlobalStyles =
		shouldLimitGlobalStyles && selectedDesign && numOfSelectedGlobalStyles && siteSlugOrId;

	// Make sure people is at the top when entering/leaving preview mode.
	useEffect( () => {
		window.scrollTo( { top: 0 } );
	}, [ isPreviewingDesign ] );

	const selectedDesignHasStyleVariations = ( selectedDesign?.style_variations || [] ).length > 0;

	function getEventPropsByDesign(
		design: Design,
		options: {
			styleVariation?: StyleVariation;
			colorVariation?: GlobalStylesObject | null;
			fontVariation?: GlobalStylesObject | null;
		} = {}
	) {
		return {
			...getDesignEventProps( {
				...options,
				flow,
				intent,
				design,
			} ),
			category: categorization.selection,
			...( design.recipe?.pattern_ids && { pattern_ids: design.recipe.pattern_ids.join( ',' ) } ),
			...( design.recipe?.header_pattern_ids && {
				header_pattern_ids: design.recipe.header_pattern_ids.join( ',' ),
			} ),
			...( design.recipe?.footer_pattern_ids && {
				footer_pattern_ids: design.recipe.footer_pattern_ids.join( ',' ),
			} ),
		};
	}

	function recordPreviewDesign( design: Design, styleVariation?: StyleVariation ) {
		recordPreviewedDesign( { flow, intent, design, styleVariation } );
	}

	function recordPreviewStyleVariation( design: Design, styleVariation?: StyleVariation ) {
		recordTracksEvent(
			'calypso_signup_design_preview_style_variation_preview_click',
			getEventPropsByDesign( design, { styleVariation } )
		);
	}

	function onChangeVariation( design: Design, styleVariation?: StyleVariation ) {
		recordTracksEvent( 'calypso_signup_design_picker_style_variation_button_click', {
			...getEventPropsByDesign( design, { styleVariation } ),
			...getVirtualDesignProps( design ),
		} );
	}

	function trackAllDesignsView() {
		recordTracksEvent( 'calypso_signup_design_scrolled_to_end', {
			intent,
			category: categorization?.selection,
		} );
	}

	function recordDesignPreviewScreenSelect( screenSlug: string ) {
		recordTracksEvent( 'calypso_signup_design_preview_screen_select', {
			screen_slug: screenSlug,
			...getEventPropsByDesign( selectedDesign as Design, {
				styleVariation: selectedStyleVariation,
				colorVariation: selectedColorVariation,
				fontVariation: selectedFontVariation,
			} ),
		} );
	}

	function recordDesignPreviewScreenBack( screenSlug: string ) {
		recordTracksEvent( 'calypso_signup_design_preview_screen_back', {
			screen_slug: screenSlug,
			...getEventPropsByDesign( selectedDesign as Design, {
				styleVariation: selectedStyleVariation,
				colorVariation: selectedColorVariation,
				fontVariation: selectedFontVariation,
			} ),
		} );
	}

	function recordDesignPreviewScreenSubmit( screenSlug: string ) {
		recordTracksEvent( 'calypso_signup_design_preview_screen_submit', {
			screen_slug: screenSlug,
			...getEventPropsByDesign( selectedDesign as Design, {
				styleVariation: selectedStyleVariation,
				colorVariation: selectedColorVariation,
				fontVariation: selectedFontVariation,
			} ),
		} );
	}

	function handleSelectColorVariation( colorVariation: GlobalStyles | null ) {
		setSelectedColorVariation( colorVariation );
		recordTracksEvent(
			'calypso_signup_design_preview_color_variation_preview_click',
			getEventPropsByDesign( selectedDesign as Design, { colorVariation } )
		);
	}

	function handleSelectFontVariation( fontVariation: GlobalStyles | null ) {
		setSelectedFontVariation( fontVariation );
		recordTracksEvent(
			'calypso_signup_design_preview_font_variation_preview_click',
			getEventPropsByDesign( selectedDesign as Design, { fontVariation } )
		);
	}

	// ********** Logic for unlocking a selected premium design

	useQueryThemes( 'wpcom', {
		number: 1000,
	} );
	useQueryProductsList();
	useQuerySitePurchases( site ? site.ID : -1 );
	useQuerySiteFeatures( [ site?.ID ] );

	const selectedDesignThemeId = selectedDesign ? getThemeIdFromDesign( selectedDesign ) : null;
	// This is needed while the screenshots property is not being indexed on ElasticSearch
	// It should be removed when this property is ready on useQueryThemes
	useQueryTheme( 'wpcom', selectedDesignThemeId );
	const theme = useSelector( ( state ) => getTheme( state, 'wpcom', selectedDesignThemeId ) );
	const fullLengthScreenshot = theme?.screenshots?.[ 0 ]?.replace( /\?.*/, '' );

	const marketplaceThemeProducts =
		useSelector( ( state ) =>
			getProductsByBillingSlug( state, marketplaceThemeBillingProductSlug( selectedDesignThemeId ) )
		) || [];
	const marketplaceProductSlug =
		marketplaceThemeProducts.length !== 0
			? getPreferredBillingCycleProductSlug( marketplaceThemeProducts )
			: null;

	const selectedMarketplaceProduct =
		marketplaceThemeProducts.find(
			( product ) => product.product_slug === marketplaceProductSlug
		) || marketplaceThemeProducts[ 0 ];

	const didPurchaseSelectedTheme = useSelector( ( state ) =>
		site && selectedDesignThemeId
			? isThemePurchased( state, selectedDesignThemeId, site.ID )
			: false
	);
	const isMarketplaceThemeSubscribed = useSelector(
		( state ) =>
			site &&
			selectedDesignThemeId &&
			getIsMarketplaceThemeSubscribed( state, selectedDesignThemeId, site.ID )
	);
	const isMarketplaceThemeSubscriptionNeeded = !! (
		marketplaceProductSlug && ! isMarketplaceThemeSubscribed
	);

	const isExternallyManagedThemeAvailable = useSelector(
		( state ) => site?.ID && isSiteEligibleForManagedExternalThemes( state, site.ID )
	);

	const isPluginBundleEligible = useIsPluginBundleEligible();
	const isBundledWithWooCommerce = selectedDesign?.is_bundled_with_woo_commerce;

	const isLockedTheme =
		( selectedDesign?.is_premium && ! isPremiumThemeAvailable && ! didPurchaseSelectedTheme ) ||
		( selectedDesign?.is_externally_managed &&
			( ! isMarketplaceThemeSubscribed || ! isExternallyManagedThemeAvailable ) ) ||
		( ! isPluginBundleEligible && isBundledWithWooCommerce );

	const [ showUpgradeModal, setShowUpgradeModal ] = useState( false );

	const eligibility = useSelector( ( state ) => site && getEligibility( state, site.ID ) );

	const hasEligibilityMessages =
		! isAtomic &&
		! isJetpack &&
		( eligibility?.eligibilityHolds?.length || eligibility?.eligibilityWarnings?.length );

	const getBadge = ( themeId: string, isLockedStyleVariation: boolean ) => (
		<ThemeTypeBadge
			canGoToCheckout={ false }
			isLockedStyleVariation={ isLockedStyleVariation }
			siteId={ site?.ID ?? null }
			siteSlug={ siteSlug }
			themeId={ themeId }
		/>
	);

	function upgradePlan() {
		if ( selectedDesign ) {
			recordTracksEvent(
				'calypso_signup_design_preview_unlock_theme_click',
				getEventPropsByDesign( selectedDesign, {
					styleVariation: selectedStyleVariation,
					colorVariation: selectedColorVariation,
					fontVariation: selectedFontVariation,
				} )
			);
		}

		recordTracksEvent( 'calypso_signup_design_upgrade_modal_show', {
			theme: selectedDesign?.slug,
		} );
		setShowUpgradeModal( true );
	}

	function closeUpgradeModal() {
		recordTracksEvent( 'calypso_signup_design_upgrade_modal_close_button_click', {
			theme: selectedDesign?.slug,
		} );
		setShowUpgradeModal( false );
	}
	function navigateToCheckout() {
		const themeHasWooCommerce = selectedDesign?.software_sets?.find(
			( set ) => set.slug === 'woo-on-plans'
		);

		let plan;
		if ( themeHasWooCommerce ) {
			plan = 'business-bundle';
		} else if ( selectedDesign?.is_externally_managed ) {
			plan = ! isExternallyManagedThemeAvailable ? PLAN_BUSINESS_MONTHLY : '';
		} else {
			plan = 'premium';
		}

		// When the user is done with checkout, send them back to the current url
		// If the theme is externally managed, send them to the marketplace thank you page
		const destination = selectedDesign?.is_externally_managed
			? addQueryArgs( `/marketplace/thank-you/${ wpcomSiteSlug ?? siteSlug }?onboarding`, {
					themes: selectedDesign?.slug,
			  } )
			: window.location.href.replace( window.location.origin, '' );

		goToCheckout( {
			flowName: flow,
			stepName,
			siteSlug: siteSlug || urlToSlug( site?.URL || '' ) || '',
			destination,
			plan,
			extraProducts:
				selectedDesign?.is_externally_managed && isMarketplaceThemeSubscriptionNeeded
					? [ marketplaceProductSlug ]
					: [],
			forceRedirection: true,
		} );
	}
	function handleCheckout() {
		recordTracksEvent( 'calypso_signup_design_upgrade_modal_checkout_button_click', {
			theme: selectedDesign?.slug,
			is_externally_managed: selectedDesign?.is_externally_managed,
		} );

		if ( siteSlugOrId ) {
			// We want to display the Eligibility Modal only for externally managed themes
			// and when no domain was purchased yet.
			if (
				selectedDesign?.is_externally_managed &&
				hasEligibilityMessages &&
				! didPurchaseDomain
			) {
				setShowEligibility( true );
			} else {
				navigateToCheckout();
			}
		}
		setShowUpgradeModal( false );
	}

	// ********** Logic for Premium Global Styles
	const [ showPremiumGlobalStylesModal, setShowPremiumGlobalStylesModal ] = useState( false );

	function unlockPremiumGlobalStyles() {
		// These conditions should be true at this point, but just in case...
		if ( shouldUnlockGlobalStyles ) {
			recordTracksEvent(
				'calypso_signup_design_global_styles_gating_modal_show',
				getEventPropsByDesign( selectedDesign, {
					styleVariation: selectedStyleVariation,
					colorVariation: selectedColorVariation,
					fontVariation: selectedFontVariation,
				} )
			);
			setShowPremiumGlobalStylesModal( true );
		}
	}

	function closePremiumGlobalStylesModal() {
		// These conditions should be true at this point, but just in case...
		if ( shouldUnlockGlobalStyles ) {
			recordTracksEvent(
				'calypso_signup_design_global_styles_gating_modal_close_button_click',
				getEventPropsByDesign( selectedDesign, {
					styleVariation: selectedStyleVariation,
					colorVariation: selectedColorVariation,
					fontVariation: selectedFontVariation,
				} )
			);
			setShowPremiumGlobalStylesModal( false );
		}
	}

	function handleCheckoutForPremiumGlobalStyles() {
		// These conditions should be true at this point, but just in case...
		if ( shouldUnlockGlobalStyles ) {
			recordTracksEvent(
				'calypso_signup_design_global_styles_gating_modal_checkout_button_click',
				getEventPropsByDesign( selectedDesign, {
					styleVariation: selectedStyleVariation,
					colorVariation: selectedColorVariation,
					fontVariation: selectedFontVariation,
				} )
			);

			goToCheckout( {
				flowName: flow,
				stepName,
				siteSlug: siteSlug || urlToSlug( site?.URL || '' ) || '',
				// When the user is done with checkout, send them back to the current url
				destination: window.location.href.replace( window.location.origin, '' ),
				plan: 'premium',
			} );

			setShowPremiumGlobalStylesModal( false );
		}
	}

	function tryPremiumGlobalStyles() {
		// These conditions should be true at this point, but just in case...
		if ( shouldUnlockGlobalStyles ) {
			recordTracksEvent(
				'calypso_signup_design_global_styles_gating_modal_try_button_click',
				getEventPropsByDesign( selectedDesign, {
					styleVariation: selectedStyleVariation,
					colorVariation: selectedColorVariation,
					fontVariation: selectedFontVariation,
				} )
			);
			pickDesign();
		}
	}

	// ********** Logic for submitting the selected design

	const { setDesignOnSite, assembleSite } = useDispatch( SITE_STORE );
	const { setPendingAction } = useDispatch( ONBOARD_STORE );

	async function pickDesign( _selectedDesign: Design | undefined = selectedDesign ) {
		setSelectedDesign( _selectedDesign );

		if ( siteSlugOrId ) {
			await updateLaunchpadSettings( siteSlugOrId, {
				checklist_statuses: { design_completed: true },
			} );
		}

		if ( siteSlugOrId && _selectedDesign ) {
			const positionIndex = designs.findIndex(
				( design ) => design.slug === _selectedDesign?.slug
			);

			setPendingAction( () => {
				if ( _selectedDesign?.is_virtual ) {
					const themeId = getThemeIdFromStylesheet( _selectedDesign.recipe?.stylesheet ?? '' );
					return Promise.resolve()
						.then( () =>
							reduxDispatch(
								activateOrInstallThenActivate(
									themeId ?? '',
									site?.ID ?? 0,
									'assembler',
									false,
									false
								) as ThunkAction< PromiseLike< string >, any, any, AnyAction >
							)
						)
						.then( ( activeThemeStylesheet: string ) =>
							assembleSite( siteSlugOrId, activeThemeStylesheet, {
								homeHtml: _selectedDesign.recipe?.pattern_html,
								headerHtml: _selectedDesign.recipe?.header_html,
								footerHtml: _selectedDesign.recipe?.footer_html,
								siteSetupOption: 'assembler-virtual-theme',
							} )
						);
				}

				return setDesignOnSite( siteSlugOrId, _selectedDesign, {
					styleVariation: selectedStyleVariation,
					globalStyles,
				} ).then( ( theme: ActiveTheme ) => {
					return reduxDispatch( setActiveTheme( site?.ID || -1, theme ) );
				} );
			} );

			handleSubmit(
				{
					selectedDesign: _selectedDesign,
					selectedSiteCategory: categorization.selection,
				},
				{ ...( positionIndex >= 0 && { position_index: positionIndex } ) }
			);
		}
	}

	function pickUnlistedDesign( theme: string ) {
		// TODO: move this logic from this step to the flow(s). See: https://wp.me/pdDR7T-KR
		exitFlow?.( `/theme/${ theme }/${ siteSlug }` );
	}

	function designYourOwn( design: Design ) {
		const shouldGoToAssembler = isAssemblerSupported();
		if ( shouldGoToAssembler ) {
			const _selectedDesign = {
				...design,
				design_type: 'assembler',
			} as Design;

			recordPreviewedDesign( {
				flow,
				intent,
				design: _selectedDesign,
			} );

			setSelectedDesign( _selectedDesign );

			handleSubmit( {
				selectedDesign: _selectedDesign,
				selectedSiteCategory: categorization.selection,
				shouldGoToAssembler,
			} );
		} else {
			pickDesign( design );
		}
	}

	function clickDesignYourOwnTopButton( design: Design ) {
		recordTracksEvent(
			'calypso_signup_design_picker_design_your_own_top_button_click',
			getDesignEventProps( { flow, intent, design } )
		);
		designYourOwn( design );
	}

	function handleSubmit( providedDependencies?: ProvidedDependencies, optionalProps?: object ) {
		const _selectedDesign = providedDependencies?.selectedDesign as Design;
		if ( ! isAssemblerDesign( _selectedDesign ) ) {
			recordSelectedDesign( {
				flow,
				intent,
				design: _selectedDesign,
				styleVariation: selectedStyleVariation,
				colorVariation: selectedColorVariation,
				fontVariation: selectedFontVariation,
				optionalProps,
			} );
		}

		submit?.( {
			...providedDependencies,
			...getDesignTypeProps( _selectedDesign ),
		} );
	}

	function handleBackClick() {
		if ( isPreviewingDesign ) {
			recordTracksEvent(
				'calypso_signup_design_preview_exit',
				getEventPropsByDesign( selectedDesign as Design, {
					styleVariation: selectedStyleVariation,
					colorVariation: selectedColorVariation,
					fontVariation: selectedFontVariation,
				} )
			);

			resetPreview();
			return;
		}

		goBack?.();
	}

	function recordDeviceClick( device: string ) {
		recordTracksEvent( 'calypso_signup_design_preview_device_click', { device } );
	}

	function recordStepContainerTracksEvent( eventName: string ) {
		const tracksProps = {
			step: 'design-step',
			intent: intent,
		};

		recordTracksEvent( eventName, tracksProps );
	}

	function getPrimaryActionButton() {
		if ( isLockedTheme ) {
			return (
				<Button className="navigation-link" primary borderless={ false } onClick={ upgradePlan }>
					{ translate( 'Unlock theme' ) }
				</Button>
			);
		}

		const selectStyle = () => {
			if ( shouldUnlockGlobalStyles ) {
				unlockPremiumGlobalStyles();
			} else {
				pickDesign();
			}
		};

		return (
			<Button className="navigation-link" primary borderless={ false } onClick={ selectStyle }>
				{ translate( 'Continue' ) }
			</Button>
		);
	}

	// ********** Main render logic

	// Don't render until we've done fetching all the data needed for initial render.
	if ( ! site || isLoadingDesigns ) {
		return <StepperLoader />;
	}

	if ( selectedDesign && isPreviewingDesign ) {
		const designTitle = selectedDesign.design_type !== 'vertical' ? selectedDesign.title : '';
		const headerDesignTitle = (
			<DesignPickerDesignTitle designTitle={ designTitle } selectedDesign={ selectedDesign } />
		);

		// If the user fills out the site title and/or tagline with write or sell intent, we show it on the design preview
		const shouldCustomizeText = intent === SiteIntent.Write || intent === SiteIntent.Sell;
		const previewUrl = getDesignPreviewUrl( selectedDesign, {
			language: locale,
			site_title: shouldCustomizeText ? siteTitle : undefined,
			site_tagline: shouldCustomizeText ? siteDescription : undefined,
		} );

		const actionButtons = (
			<>
				<div className="action-buttons__title">{ headerDesignTitle }</div>
				<div>{ getPrimaryActionButton() }</div>
			</>
		);

		const stepContent = (
			<>
				<UpgradeModal
					slug={ selectedDesign.slug }
					isOpen={ showUpgradeModal }
					isMarketplacePlanSubscriptionNeeeded={ ! isExternallyManagedThemeAvailable }
					isMarketplaceThemeSubscriptionNeeded={ isMarketplaceThemeSubscriptionNeeded }
					marketplaceProduct={ selectedMarketplaceProduct }
					closeModal={ closeUpgradeModal }
					checkout={ handleCheckout }
				/>
				<QueryEligibility siteId={ site?.ID } />
				<EligibilityWarningsModal
					site={ site }
					isMarketplace={ selectedDesign?.is_externally_managed }
					isOpen={ showEligibility }
					handleClose={ () => {
						recordTracksEvent( 'calypso_automated_transfer_eligibility_modal_dismiss', {
							flow: 'onboarding',
							theme: selectedDesign?.slug,
						} );
						setShowEligibility( false );
					} }
					handleContinue={ () => {
						navigateToCheckout();
						setShowEligibility( false );
					} }
				/>
				<PremiumGlobalStylesUpgradeModal
					checkout={ handleCheckoutForPremiumGlobalStyles }
					closeModal={ closePremiumGlobalStylesModal }
					isOpen={ showPremiumGlobalStylesModal }
					tryStyle={ tryPremiumGlobalStyles }
					numOfSelectedGlobalStyles={ numOfSelectedGlobalStyles }
				/>
				<AsyncLoad
					require="@automattic/design-preview"
					placeholder={ null }
					previewUrl={ previewUrl }
					splitDefaultVariation={
						! selectedDesign.is_premium &&
						! isBundledWithWooCommerce &&
						! isPremiumThemeAvailable &&
						! didPurchaseSelectedTheme &&
						! isPluginBundleEligible &&
						shouldLimitGlobalStyles
					}
					title={ headerDesignTitle }
					selectedDesignTitle={ designTitle }
					shortDescription={ selectedDesign.shortDescription }
					description={ selectedDesign?.description }
					variations={ selectedDesignHasStyleVariations ? selectedDesign?.style_variations : [] }
					selectedVariation={ selectedStyleVariation }
					onSelectVariation={ previewDesignVariation }
					actionButtons={ actionButtons }
					recordDeviceClick={ recordDeviceClick }
					limitGlobalStyles={ shouldLimitGlobalStyles }
					siteId={ site.ID }
					stylesheet={ selectedDesign.recipe?.stylesheet }
					screenshot={ fullLengthScreenshot }
					isExternallyManaged={ selectedDesign.is_externally_managed }
					isVirtual={ selectedDesign.is_virtual }
					disableGlobalStyles={ disableCheckoutImmediately }
					selectedColorVariation={ selectedColorVariation }
					onSelectColorVariation={ handleSelectColorVariation }
					selectedFontVariation={ selectedFontVariation }
					onSelectFontVariation={ handleSelectFontVariation }
					onGlobalStylesChange={ setGlobalStyles }
					onNavigatorPathChange={ ( path?: string ) => setShouldHideActionButtons( path !== '/' ) }
					onScreenSelect={ recordDesignPreviewScreenSelect }
					onScreenBack={ recordDesignPreviewScreenBack }
					onScreenSubmit={ recordDesignPreviewScreenSubmit }
				/>
			</>
		);

		return (
			<StepContainer
				stepName={ STEP_NAME }
				stepContent={ stepContent }
				hideSkip
				hideBack={ shouldHideActionButtons }
				className="design-setup__preview design-setup__preview__has-more-info"
				goBack={ handleBackClick }
				customizedActionButtons={ ! shouldHideActionButtons ? actionButtons : undefined }
				recordTracksEvent={ recordStepContainerTracksEvent }
			/>
		);
	}

	const heading = (
		<FormattedHeader
			id="step-header"
			headerText={ translate( 'Pick a design' ) }
			subHeaderText={ translate(
				'One of these homepage options could be great to start with. You can always change later.'
			) }
		/>
	);

	if ( isDesignFirstFlow ) {
		categorization.categories = [];
		categorization.selection = 'blog';
	}

	const stepContent = (
		<UnifiedDesignPicker
			designs={ designs }
			locale={ locale }
			onDesignYourOwn={ designYourOwn }
			onClickDesignYourOwnTopButton={ clickDesignYourOwnTopButton }
			onPreview={ previewDesign }
			onChangeVariation={ onChangeVariation }
			onViewAllDesigns={ trackAllDesignsView }
			heading={ heading }
			categorization={ categorization }
			isPremiumThemeAvailable={ isPremiumThemeAvailable }
			shouldLimitGlobalStyles={ shouldLimitGlobalStyles }
			getBadge={ getBadge }
		/>
	);

	return (
		<StepContainer
			stepName={ STEP_NAME }
			className="unified-design-picker__has-categories"
			skipButtonAlign="top"
			hideFormattedHeader
			hideSkip
			backLabelText={ translate( 'Back' ) }
			stepContent={ stepContent }
			recordTracksEvent={ recordStepContainerTracksEvent }
			goNext={ handleSubmit }
			goBack={ handleBackClick }
		/>
	);
};

export default UnifiedDesignPickerStep;
