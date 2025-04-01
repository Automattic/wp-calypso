import {
	TERM_ANNUALLY,
	TERM_MONTHLY,
	WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED,
	getPlan,
	isFreePlan,
	findFirstSimilarPlanKey,
} from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import {
	Onboard,
	updateLaunchpadSettings,
	useStarterDesignBySlug,
	useStarterDesignsQuery,
} from '@automattic/data-stores';
import {
	UnifiedDesignPicker,
	useCategorization,
	useDesignPickerFilters,
	getDesignPreviewUrl,
	PERSONAL_THEME,
	getThemeIdFromDesign,
} from '@automattic/design-picker';
import { useLocale, useHasEnTranslation } from '@automattic/i18n-utils';
import { StepContainer, ONBOARDING_FLOW, isSiteSetupFlow, Step } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useState, useEffect, useCallback } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import QueryEligibility from 'calypso/components/data/query-atat-eligibility';
import { useQueryTheme } from 'calypso/components/data/query-theme';
import { useQueryThemes } from 'calypso/components/data/query-themes';
import FormattedHeader from 'calypso/components/formatted-header';
import Loading from 'calypso/components/loading';
import PremiumGlobalStylesUpgradeModal from 'calypso/components/premium-global-styles-upgrade-modal';
import {
	THEME_TIERS,
	THEME_TIER_PREMIUM,
	THEME_TIER_FREE,
} from 'calypso/components/theme-tier/constants';
import ThemeTierBadge from 'calypso/components/theme-tier/theme-tier-badge';
import { ThemeUpgradeModal as UpgradeModal } from 'calypso/components/theme-upgrade-modal';
import { useActiveThemeQuery } from 'calypso/data/themes/use-active-theme-query';
import { useIsBigSkyEligible } from 'calypso/landing/stepper/hooks/use-is-site-big-sky-eligible';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useExperiment } from 'calypso/lib/explat';
import { urlToSlug } from 'calypso/lib/url';
import { useDispatch as useReduxDispatch, useSelector } from 'calypso/state';
import { getEligibility } from 'calypso/state/automated-transfer/selectors';
import { hasPurchasedDomain } from 'calypso/state/purchases/selectors/has-purchased-domain';
import { useSiteGlobalStylesOnPersonal } from 'calypso/state/sites/hooks/use-site-global-styles-on-personal';
import { useSiteGlobalStylesStatus } from 'calypso/state/sites/hooks/use-site-global-styles-status';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { useIsThemeAllowedOnSite } from 'calypso/state/themes/hooks/use-is-theme-allowed-on-site';
import { getTheme, getThemeDemoUrl } from 'calypso/state/themes/selectors';
import { isThemePurchased } from 'calypso/state/themes/selectors/is-theme-purchased';
import { useActivateDesign } from '../../../../hooks/use-activate-design';
import { useIsPluginBundleEligible } from '../../../../hooks/use-is-plugin-bundle-eligible';
import { useMarketplaceThemeProducts } from '../../../../hooks/use-marketplace-theme-products';
import { useQuery } from '../../../../hooks/use-query';
import { useSiteData } from '../../../../hooks/use-site-data';
import { ONBOARD_STORE, SITE_STORE } from '../../../../stores';
import { goToCheckout } from '../../../../utils/checkout';
import { shouldUseStepContainerV2 } from '../../../helpers/should-use-step-container-v2';
import { useGoalsFirstExperiment } from '../../../helpers/use-goals-first-experiment';
import {
	getDesignEventProps,
	recordPreviewedDesign,
	recordSelectedDesign,
} from '../../analytics/record-design';
import { getCategorizationOptions } from './categories';
import { STEP_NAME } from './constants';
import DesignPickerDesignTitle from './design-picker-design-title';
import { EligibilityWarningsModal } from './eligibility-warnings-modal';
import useIsUpdatedBadgeDesign from './hooks/use-is-updated-badge-design';
import useRecipe from './hooks/use-recipe';
import useTrackFilters from './hooks/use-track-filters';
import type { Step as StepType } from '../../types';
import type { OnboardSelect, SiteSelect, GlobalStyles } from '@automattic/data-stores';
import type { Design, StyleVariation } from '@automattic/design-picker';
import type { GlobalStylesObject } from '@automattic/global-styles';
import './style.scss';

const SiteIntent = Onboard.SiteIntent;

const EMPTY_ARRAY: Design[] = [];
const EMPTY_OBJECT = {};

const UnifiedDesignPickerStep: StepType< {
	submits: {
		selectedDesign?: Design;
		eventProps: {
			is_filter_included_with_plan_enabled: boolean;
			is_big_sky_eligible: boolean;
			preselected_filters: string;
			selected_filters: string;
		};
	};
} > = ( { navigation, flow, stepName } ) => {
	// imageOptimizationExperimentAssignment, exerimentAssignment
	const [ isLoadingExperiment, experimentAssignment ] = useExperiment(
		'calypso_design_picker_image_optimization_202406'
	);
	const variantName = experimentAssignment?.variationName;
	const oldHighResImageLoading = ! isLoadingExperiment && variantName === 'treatment';

	const [ isGoalsAtFrontExperimentLoading, isGoalsAtFrontExperiment ] = useGoalsFirstExperiment();
	const isSiteRequired = flow !== ONBOARDING_FLOW || ! isGoalsAtFrontExperiment;

	const isUpdatedBadgeDesign = useIsUpdatedBadgeDesign();

	const { isEligible: isBigSkyEligible } = useIsBigSkyEligible();

	const queryParams = useQuery();
	const { goBack, submit, exitFlow } = navigation;

	const reduxDispatch = useReduxDispatch();

	const translate = useTranslate();
	const locale = useLocale();
	const hasEnTranslation = useHasEnTranslation();

	const { intent, goals } = useSelect( ( select ) => {
		const onboardStore = select( ONBOARD_STORE ) as OnboardSelect;
		return {
			intent: onboardStore.getIntent(),
			goals: onboardStore.getGoals(),
		};
	}, [] );

	const { site, siteSlug, siteId, siteSlugOrId } = useSiteData();
	const siteTitle = site?.name;
	const siteDescription = site?.description;
	const { shouldLimitGlobalStyles } = useSiteGlobalStylesStatus( site?.ID );
	const { data: siteActiveTheme } = useActiveThemeQuery( site?.ID ?? 0, !! site?.ID );
	// @TODO Cleanup once the test phase is over.
	const isGlobalStylesOnPersonal = useSiteGlobalStylesOnPersonal( site?.ID );

	const wpcomSiteSlug = useSelector( ( state ) => getSiteSlug( state, site?.ID ) );
	const didPurchaseDomain = useSelector(
		( state ) => site?.ID && hasPurchasedDomain( state, site.ID )
	);

	const [ shouldHideActionButtons, setShouldHideActionButtons ] = useState( false );
	const [ showEligibility, setShowEligibility ] = useState( false );

	const isJetpack = useSelect(
		( select ) => site && ( select( SITE_STORE ) as SiteSelect ).isJetpackSite( site.ID ),
		[ site ]
	);
	const isAtomic = useSelect(
		( select ) => site && ( select( SITE_STORE ) as SiteSelect ).isSiteAtomic( site.ID ),
		[ site ]
	);
	const { setPendingAction } = useDispatch( ONBOARD_STORE );
	const isComingFromTheUpgradeScreen = queryParams.get( 'continue' ) === '1';
	const isComingFromSuccessfulImport = queryParams.get( 'comingFromSuccessfulImport' ) === '1';

	const isPremiumThemeAvailable = Boolean(
		useSelect(
			( select ) =>
				site &&
				( select( SITE_STORE ) as SiteSelect ).siteHasFeature(
					site.ID,
					WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED
				),
			[ site ]
		)
	);

	const { setDesignOnSite, assembleSite } = useDispatch( SITE_STORE );
	const activateDesign = useActivateDesign();

	const { data: allDesigns, isLoading: isLoadingDesigns } = useStarterDesignsQuery(
		{
			seed: siteSlugOrId ? String( siteSlugOrId ) : undefined,
			goals: goals.length > 0 ? goals : [ 'none' ],
			_locale: locale,
		},
		{
			enabled: true,
		}
	);

	const designs = allDesigns?.designs ?? EMPTY_ARRAY;
	const categorizationOptions = getCategorizationOptions( goals );

	const { commonFilterProperties, handleSelectFilter, handleDeselectFilter } = useTrackFilters( {
		preselectedFilters: categorizationOptions.defaultSelections,
		isBigSkyEligible,
	} );

	const categorization = useCategorization( allDesigns?.filters?.subject || EMPTY_OBJECT, {
		...categorizationOptions,
		handleSelect: handleSelectFilter,
		handleDeselect: handleDeselectFilter,
	} );

	const designPickerFilters = useDesignPickerFilters();

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
	} = useRecipe( allDesigns, pickUnlistedDesign, recordPreviewDesign, recordPreviewStyleVariation );

	const shouldUnlockGlobalStyles =
		shouldLimitGlobalStyles && selectedDesign && numOfSelectedGlobalStyles && siteSlugOrId;

	// Make sure people is at the top when entering/leaving preview mode.
	useEffect( () => {
		window.scrollTo( { top: 0 } );
	}, [ isPreviewingDesign ] );

	const selectedDesignHasStyleVariations = ( selectedDesign?.style_variations || [] ).length > 0;
	const { data: selectedDesignDetails } = useStarterDesignBySlug( selectedDesign?.slug || '', {
		enabled: isPreviewingDesign,
	} );

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
			categories: categorization.selections?.join( ',' ),
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

	function trackAllDesignsView() {
		recordTracksEvent( 'calypso_signup_design_scrolled_to_end', {
			intent,
			categories: categorization?.selections?.join( ',' ),
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

	const selectedDesignThemeId = selectedDesign ? getThemeIdFromDesign( selectedDesign ) : null;
	// This is needed while the screenshots property is not being indexed on ElasticSearch
	// It should be removed when this property is ready on useQueryThemes
	useQueryTheme( 'wpcom', selectedDesignThemeId );
	const theme = useSelector( ( state ) => getTheme( state, 'wpcom', selectedDesignThemeId ) );

	const selectedDesignSlug = selectedDesign?.slug || '';

	// Get theme URL for the design preview.
	const themeDemoUrl = useSelector(
		( state ) =>
			getThemeDemoUrl( state, selectedDesignSlug, siteId + '' ) +
			'?demo=true&iframe=true&theme_preview=true'
	);
	const screenshot = theme?.screenshots?.[ 0 ] ?? theme?.screenshot;
	const fullLengthScreenshot = screenshot?.replace( /\?.*/, '' );

	const {
		selectedMarketplaceProduct,
		selectedMarketplaceProductCartItems,
		isMarketplaceThemeSubscriptionNeeded,
		isMarketplaceThemeSubscribed,
		isExternallyManagedThemeAvailable,
	} = useMarketplaceThemeProducts();

	const requiredPlanSlug = getRequiredPlan( selectedDesign, site?.plan?.product_slug || '' );

	const didPurchaseSelectedTheme = useSelector( ( state ) =>
		site && selectedDesignThemeId
			? isThemePurchased( state, selectedDesignThemeId, site.ID )
			: false
	);

	const canSiteActivateTheme = useIsThemeAllowedOnSite(
		site?.ID ?? null,
		selectedDesignThemeId ?? ''
	);

	const isPluginBundleEligible = useIsPluginBundleEligible();
	const isBundled = selectedDesign?.software_sets && selectedDesign.software_sets.length > 0;

	const isLockedTheme =
		// The exp moves the Design Picker step in front of the plan selection so people can unlock theme later.
		! isGoalsAtFrontExperiment &&
		( ! canSiteActivateTheme ||
			( selectedDesign?.design_tier === THEME_TIER_PREMIUM &&
				! isPremiumThemeAvailable &&
				! didPurchaseSelectedTheme ) ||
			( selectedDesign?.is_externally_managed &&
				( ! isMarketplaceThemeSubscribed || ! isExternallyManagedThemeAvailable ) ) ||
			( ! isPluginBundleEligible && isBundled ) );

	const [ showUpgradeModal, setShowUpgradeModal ] = useState( false );

	const eligibility = useSelector( ( state ) => site && getEligibility( state, site.ID ) );

	const hasEligibilityMessages =
		! isAtomic &&
		! isJetpack &&
		( eligibility?.eligibilityHolds?.length || eligibility?.eligibilityWarnings?.length );

	const getBadge = ( themeId: string, isLockedStyleVariation: boolean ) => (
		<ThemeTierBadge
			canGoToCheckout={ false }
			isThemeList
			isLockedStyleVariation={ isLockedStyleVariation }
			siteId={ siteId }
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
		// When the user is done with checkout, send them back to the current url
		// If the theme is externally managed, send them to the marketplace thank you page
		const destination = selectedDesign?.is_externally_managed
			? addQueryArgs( `/marketplace/thank-you/${ wpcomSiteSlug ?? siteSlug }?onboarding`, {
					themes: selectedDesign?.slug,
			  } )
			: addQueryArgs( window.location.href.replace( window.location.origin, '' ), {
					continue: 1,
			  } );

		goToCheckout( {
			flowName: flow,
			stepName,
			siteSlug: siteSlug || urlToSlug( site?.URL || '' ) || '',
			destination,
			plan: requiredPlanSlug,
			extraProducts: selectedMarketplaceProductCartItems,
		} );
	}
	function handleCheckout() {
		recordTracksEvent( 'calypso_signup_design_upgrade_modal_checkout_button_click', {
			theme: selectedDesign?.slug,
			theme_tier: selectedDesign?.design_tier,
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
				plan: isGlobalStylesOnPersonal ? 'personal' : 'premium',
			} );

			setShowPremiumGlobalStylesModal( false );
		}
	}

	const handleSubmit = useCallback(
		(
			providedDependencies?: { selectedDesign?: Design; selectedSiteCategory?: string },
			optionalProps?: object
		) => {
			const _selectedDesign = providedDependencies?.selectedDesign as Design;
			recordSelectedDesign( {
				...commonFilterProperties,
				flow,
				intent,
				design: _selectedDesign,
				styleVariation: selectedStyleVariation,
				colorVariation: selectedColorVariation,
				fontVariation: selectedFontVariation,
				optionalProps,
			} );

			submit?.( {
				...providedDependencies,
				eventProps: commonFilterProperties,
			} );
		},
		[
			commonFilterProperties,
			flow,
			intent,
			selectedStyleVariation,
			selectedColorVariation,
			selectedFontVariation,
			submit,
		]
	);

	const pickDesign = useCallback(
		async ( _selectedDesign: Design | undefined = selectedDesign ) => {
			setSelectedDesign( _selectedDesign );

			if ( siteSlugOrId ) {
				await updateLaunchpadSettings( siteSlugOrId, {
					checklist_statuses: { design_completed: true },
				} );
			}

			const optionalProps: { position_index?: number } = {};
			const positionIndex = designs.findIndex(
				( design ) => design.slug === _selectedDesign?.slug
			);

			if ( positionIndex >= 0 ) {
				optionalProps.position_index = positionIndex;
			}

			if ( siteSlugOrId && _selectedDesign ) {
				setPendingAction( async () => {
					await activateDesign( _selectedDesign, {
						styleVariation: selectedStyleVariation || _selectedDesign?.style_variations?.[ 0 ],
						globalStyles,
					} );
				} );

				handleSubmit(
					{
						selectedDesign: _selectedDesign,
					},
					optionalProps
				);
			} else if ( ! isSiteRequired && ! siteSlugOrId && _selectedDesign ) {
				handleSubmit(
					{
						selectedDesign: _selectedDesign,
						selectedSiteCategory: categorization.selections?.join( ',' ),
					},
					optionalProps
				);
			}
		},
		[
			activateDesign,
			assembleSite,
			categorization.selections,
			designs,
			globalStyles,
			handleSubmit,
			isSiteRequired,
			reduxDispatch,
			selectedDesign,
			selectedStyleVariation,
			setDesignOnSite,
			setPendingAction,
			setSelectedDesign,
			site?.ID,
			siteSlugOrId,
		]
	);

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

	function pickUnlistedDesign( theme: string ) {
		// TODO: move this logic from this step to the flow(s). See: https://wp.me/pdDR7T-KR
		exitFlow?.( `/theme/${ theme }/${ siteSlug }` );
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

		designPickerFilters.resetFilters();
		goBack?.();
	}

	function recordDeviceClick( device: string ) {
		recordTracksEvent( 'calypso_signup_design_preview_device_click', { device } );
	}

	function recordStepContainerTracksEvent( eventName: string ) {
		recordTracksEvent( eventName, {
			step: 'design-setup',
			flow,
			intent,
		} );
	}
	function getPrimaryActionButtonAction(): () => void {
		if ( isGlobalStylesOnPersonal ) {
			if ( isLockedTheme ) {
				return upgradePlan;
			}

			if ( shouldUnlockGlobalStyles ) {
				return unlockPremiumGlobalStyles;
			}

			return () => pickDesign();
		}

		const isPersonalDesign = selectedDesign?.design_tier === PERSONAL_THEME;
		if ( isLockedTheme ) {
			// For personal themes we favor the GS Upgrade Modal over the Plan Upgrade Modal.
			return isPersonalDesign && shouldUnlockGlobalStyles ? unlockPremiumGlobalStyles : upgradePlan;
		}

		return shouldUnlockGlobalStyles ? unlockPremiumGlobalStyles : () => pickDesign();
	}

	const isUsingStepContainerV2 = shouldUseStepContainerV2( flow );

	function getPrimaryActionButton() {
		const action = getPrimaryActionButtonAction();
		const text =
			action === upgradePlan && ! isGoalsAtFrontExperiment
				? translate( 'Unlock theme' )
				: translate( 'Continue' );

		if ( ! isUsingStepContainerV2 ) {
			return (
				<Button className="navigation-link" primary borderless={ false } onClick={ action }>
					{ text }
				</Button>
			);
		}

		return <Step.PrimaryButton onClick={ action }>{ text }</Step.PrimaryButton>;
	}

	useEffect( () => {
		if ( isComingFromTheUpgradeScreen ) {
			pickDesign();
		}
	}, [ isComingFromTheUpgradeScreen, pickDesign ] );

	// ********** Main render logic

	// Don't render until we've done fetching all the data needed for initial render.
	const isSiteLoading = ! site && isSiteRequired;
	const isDesignsLoading = isLoadingDesigns || isGoalsAtFrontExperimentLoading;
	const isLoading = isSiteLoading || isDesignsLoading;

	if ( isLoading || isComingFromTheUpgradeScreen ) {
		return isUsingStepContainerV2 ? <Step.Loading /> : <Loading />;
	}

	if ( selectedDesign && isPreviewingDesign ) {
		const designTitle = selectedDesign.design_type !== 'vertical' ? selectedDesign.title : '';
		const headerDesignTitle = (
			<DesignPickerDesignTitle
				designTitle={ designTitle }
				selectedDesign={ selectedDesign }
				siteId={ siteId }
				siteSlug={ siteSlug }
			/>
		);

		// If the user fills out the site title and/or tagline with write or sell intent, we show it on the design preview
		const shouldCustomizeText = intent === SiteIntent.Write || intent === SiteIntent.Sell;
		const previewUrl = getDesignPreviewUrl( selectedDesign, {
			site_title: shouldCustomizeText ? siteTitle : undefined,
			site_tagline: shouldCustomizeText ? siteDescription : undefined,
		} );

		const getActionButtons = () => {
			if ( ! isUsingStepContainerV2 ) {
				return (
					<>
						<div className="action-buttons__title">{ headerDesignTitle }</div>
						<div>{ getPrimaryActionButton() }</div>
					</>
				);
			}

			return getPrimaryActionButton();
		};

		const actionButtons = getActionButtons();

		const stepContent = (
			<>
				{ requiredPlanSlug && ! isGoalsAtFrontExperiment && (
					<UpgradeModal
						slug={ selectedDesign.slug }
						isOpen={ showUpgradeModal }
						//TODO: Fix NEEED typo
						isMarketplacePlanSubscriptionNeeeded={ ! isExternallyManagedThemeAvailable }
						isMarketplaceThemeSubscriptionNeeded={ isMarketplaceThemeSubscriptionNeeded }
						marketplaceProduct={ selectedMarketplaceProduct }
						requiredPlan={ requiredPlanSlug }
						closeModal={ closeUpgradeModal }
						checkout={ handleCheckout }
					/>
				) }
				<QueryEligibility siteId={ site?.ID } />
				<EligibilityWarningsModal
					site={ site ?? undefined }
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
					numOfSelectedGlobalStyles={ numOfSelectedGlobalStyles }
					{ ...( ! isLockedTheme && { tryStyle: tryPremiumGlobalStyles } ) }
				/>
				<AsyncLoad
					require="@automattic/design-preview"
					placeholder={ null }
					previewUrl={ themeDemoUrl || previewUrl }
					siteInfo={ {
						title: shouldCustomizeText ? site?.name : '',
						tagline: shouldCustomizeText ? site?.description : '',
					} }
					splitDefaultVariation={
						( isGlobalStylesOnPersonal &&
							selectedDesign?.design_tier === THEME_TIER_FREE &&
							shouldLimitGlobalStyles ) ||
						( ! ( selectedDesign?.design_tier === THEME_TIER_PREMIUM ) &&
							! isBundled &&
							! isPremiumThemeAvailable &&
							! didPurchaseSelectedTheme &&
							! isPluginBundleEligible &&
							! isGlobalStylesOnPersonal &&
							shouldLimitGlobalStyles )
					}
					needsUpgrade={ shouldLimitGlobalStyles || isLockedTheme }
					title={ headerDesignTitle }
					selectedDesignTitle={ designTitle }
					shortDescription={ selectedDesign.description }
					description={ selectedDesignDetails?.description }
					variations={
						selectedDesignHasStyleVariations ? selectedDesignDetails?.style_variations : []
					}
					selectedVariation={ selectedStyleVariation }
					onSelectVariation={ previewDesignVariation }
					actionButtons={ actionButtons }
					recordDeviceClick={ recordDeviceClick }
					limitGlobalStyles={ shouldLimitGlobalStyles }
					siteId={ site?.ID }
					stylesheet={ selectedDesign.recipe?.stylesheet }
					screenshot={ fullLengthScreenshot }
					isExternallyManaged={ selectedDesign.is_externally_managed }
					isVirtual={ selectedDesign.is_virtual }
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

		if ( isUsingStepContainerV2 ) {
			// TODO: Create a new wireframe for the design preview. It should be named "FixedColumnOnTheLeftLayout"
			return (
				<Step.FullWidthLayout
					className="step-container-v2--design-picker-preview"
					topBar={ ( { isLargeViewport } ) => {
						if ( ! isLargeViewport ) {
							return null;
						}

						return (
							<Step.TopBar
								leftElement={
									shouldHideActionButtons ? undefined : (
										<Step.BackButton onClick={ handleBackClick } />
									)
								}
								rightElement={
									! isGoalsAtFrontExperiment ? undefined : (
										<Step.SkipButton onClick={ () => handleSubmit() }>
											{ translate( 'Skip setup' ) }
										</Step.SkipButton>
									)
								}
							/>
						);
					} }
					stickyBottomBar={ ( { isLargeViewport } ) => {
						if ( isLargeViewport ) {
							return null;
						}

						return (
							<Step.StickyBottomBar
								leftElement={ <Step.BackButton onClick={ handleBackClick } /> }
								centerElement={
									<div className="step-container-v2--design-picker-preview__header-design-title">
										{ headerDesignTitle }
									</div>
								}
								rightElement={ actionButtons }
							/>
						);
					} }
				>
					{ stepContent }
				</Step.FullWidthLayout>
			);
		}

		return (
			<StepContainer
				stepName={ STEP_NAME }
				stepContent={ stepContent }
				hideSkip={ ! isGoalsAtFrontExperiment }
				skipLabelText={ translate( 'Skip setup' ) }
				skipButtonAlign="top"
				hideBack={ shouldHideActionButtons }
				className="design-setup__preview design-setup__preview__has-more-info"
				goBack={ handleBackClick }
				customizedActionButtons={ ! shouldHideActionButtons ? actionButtons : undefined }
				recordTracksEvent={ recordStepContainerTracksEvent }
			/>
		);
	}

	const headerText = hasEnTranslation( 'Pick a theme' )
		? translate( 'Pick a theme' )
		: translate( 'Pick a design' );

	const subHeaderText = translate(
		'Choose a homepage design that works for you. You can always change it later.'
	);

	// Use this to prioritize themes in certain categories.
	// The specified theme will be shown first in the list.
	const priorityThemes: Record< string, string > = {
		education: 'course',
	};

	const stepContent = (
		<>
			<UnifiedDesignPicker
				designs={ designs }
				priorityThemes={ priorityThemes }
				locale={ locale }
				onPreview={ previewDesign }
				onViewAllDesigns={ trackAllDesignsView }
				heading={
					! isUsingStepContainerV2 ? (
						<FormattedHeader
							id="step-header"
							headerText={ headerText }
							subHeaderText={ subHeaderText }
						/>
					) : undefined
				}
				categorization={ categorization }
				isPremiumThemeAvailable={ isPremiumThemeAvailable }
				// TODO: Update the ThemeCard component once the new design is rolled out completely
				// to avoid passing the getBadge and getOptionsMenu prop conditionally down the component tree.
				getBadge={ isUpdatedBadgeDesign ? undefined : getBadge }
				getOptionsMenu={ isUpdatedBadgeDesign ? getBadge : undefined }
				oldHighResImageLoading={ oldHighResImageLoading }
				siteActiveTheme={ siteActiveTheme?.[ 0 ]?.stylesheet ?? null }
				showActiveThemeBadge={
					intent !== SiteIntent.Build &&
					! isSiteSetupFlow( flow ) &&
					intent !== SiteIntent.UpdateDesign
				}
				isMultiFilterEnabled
				isBigSkyEligible={ isBigSkyEligible }
			/>
		</>
	);

	const getGoBackHandler = () => {
		if ( isComingFromSuccessfulImport ) {
			return undefined;
		}
		return intent === 'update-design'
			? () =>
					submit?.( {
						eventProps: commonFilterProperties,
					} )
			: () => handleBackClick();
	};

	const backButton = getGoBackHandler();
	const hideSkip = ! isGoalsAtFrontExperiment && ! isComingFromSuccessfulImport;
	const skipLabelText = isComingFromSuccessfulImport
		? translate( 'Skip to dashboard' )
		: translate( 'Skip setup' );

	if ( isUsingStepContainerV2 ) {
		return (
			<Step.WideLayout
				className="step-container-v2--design-picker"
				topBar={
					<Step.TopBar
						leftElement={ backButton ? <Step.BackButton onClick={ backButton } /> : undefined }
						rightElement={
							hideSkip ? undefined : (
								<Step.SkipButton onClick={ () => handleSubmit() }>
									{ skipLabelText }
								</Step.SkipButton>
							)
						}
					/>
				}
				heading={ <Step.Heading text={ headerText } subText={ subHeaderText } /> }
			>
				{ stepContent }
			</Step.WideLayout>
		);
	}

	return (
		<StepContainer
			stepName={ STEP_NAME }
			className="unified-design-picker__has-categories"
			skipButtonAlign="top"
			hideFormattedHeader
			hideSkip={ hideSkip }
			skipLabelText={ skipLabelText }
			backLabelText={ translate( 'Back' ) }
			stepContent={ stepContent }
			recordTracksEvent={ recordStepContainerTracksEvent }
			goNext={ handleSubmit }
			goBack={ backButton }
		/>
	);
};

function getRequiredPlan( selectedDesign: Design | undefined, currentPlanSlug: string ) {
	if ( ! selectedDesign?.design_tier ) {
		return;
	}
	// Different designs require different plans to unlock them, additionally the terms required can vary.
	// A site with a plan of a given length cannot upgrade a plan of a shorter length. For example,
	// if a site is on a 2 year starter plan and want to buy an explorer theme, they must buy a 2 year explorer plan
	// not a 1 year explorer plan.
	const tierMinimumUpsellPlan =
		THEME_TIERS[ selectedDesign.design_tier as keyof typeof THEME_TIERS ]?.minimumUpsellPlan;

	let requiredTerm;
	if ( ! currentPlanSlug || isFreePlan( currentPlanSlug ) ) {
		// Marketplace themes require upgrading to a monthly business plan or higher, everything else requires an annual plan.
		requiredTerm = selectedDesign?.is_externally_managed ? TERM_MONTHLY : TERM_ANNUALLY;
	} else {
		requiredTerm = getPlan( currentPlanSlug )?.term || TERM_ANNUALLY;
	}

	return findFirstSimilarPlanKey( tierMinimumUpsellPlan, { term: requiredTerm } );
}

export default UnifiedDesignPickerStep;
