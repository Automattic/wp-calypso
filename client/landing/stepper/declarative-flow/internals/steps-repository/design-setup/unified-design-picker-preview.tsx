import {
	TERM_ANNUALLY,
	TERM_MONTHLY,
	getPlan,
	isFreePlan,
	findFirstSimilarPlanKey,
} from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { Onboard, useStarterDesignBySlug } from '@automattic/data-stores';
import {
	getDesignPreviewUrl,
	PERSONAL_THEME,
	getThemeIdFromDesign,
} from '@automattic/design-picker';
import DesignPreview, { useScreens, type DesignPreviewProps } from '@automattic/design-preview';
import { StepContainer, Step } from '@automattic/onboarding';
import { Navigator } from '@wordpress/components/build-types/navigator/types';
import { useSelect } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useState, useRef } from 'react';
import QueryEligibility from 'calypso/components/data/query-atat-eligibility';
import { useQueryTheme } from 'calypso/components/data/query-theme';
import PremiumGlobalStylesUpgradeModal from 'calypso/components/premium-global-styles-upgrade-modal';
import {
	THEME_TIERS,
	THEME_TIER_PREMIUM,
	THEME_TIER_FREE,
} from 'calypso/components/theme-tier/constants';
import { ThemeUpgradeModal as UpgradeModal } from 'calypso/components/theme-upgrade-modal';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { urlToSlug } from 'calypso/lib/url';
import { useSelector } from 'calypso/state';
import { getEligibility } from 'calypso/state/automated-transfer/selectors';
import { hasPurchasedDomain } from 'calypso/state/purchases/selectors/has-purchased-domain';
import { useSiteGlobalStylesOnPersonal } from 'calypso/state/sites/hooks/use-site-global-styles-on-personal';
import { useSiteGlobalStylesStatus } from 'calypso/state/sites/hooks/use-site-global-styles-status';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { useIsThemeAllowedOnSite } from 'calypso/state/themes/hooks/use-is-theme-allowed-on-site';
import { getTheme, getThemeDemoUrl } from 'calypso/state/themes/selectors';
import { isThemePurchased } from 'calypso/state/themes/selectors/is-theme-purchased';
import { useIsPluginBundleEligible } from '../../../../hooks/use-is-plugin-bundle-eligible';
import { useMarketplaceThemeProducts } from '../../../../hooks/use-marketplace-theme-products';
import { useSiteData } from '../../../../hooks/use-site-data';
import { SITE_STORE, ONBOARD_STORE } from '../../../../stores';
import { goToCheckout } from '../../../../utils/checkout';
import { shouldUseStepContainerV2 } from '../../../helpers/should-use-step-container-v2';
import { useGoalsFirstExperiment } from '../../../helpers/use-goals-first-experiment';
import { STEP_NAME } from './constants';
import DesignPickerDesignTitle from './design-picker-design-title';
import { EligibilityWarningsModal } from './eligibility-warnings-modal';
import type { SiteSelect, GlobalStyles, OnboardSelect } from '@automattic/data-stores';
import type { Design, StyleVariation } from '@automattic/design-picker';
import type { GlobalStylesObject } from '@automattic/global-styles';

const SiteIntent = Onboard.SiteIntent;

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

interface UnifiedDesignPickerPreviewProps {
	selectedDesign: Design;
	pickDesign: () => void;
	getEventPropsByDesign: (
		design: Design,
		options: {
			styleVariation?: StyleVariation;
			colorVariation?: GlobalStylesObject | null;
			fontVariation?: GlobalStylesObject | null;
		}
	) => Record< string, unknown >;
	flow: string;
	isPremiumThemeAvailable: boolean;
	stepName: string;
	handleSubmit: () => void;
	numOfSelectedGlobalStyles: number;
	previewDesignVariation: ( variation: StyleVariation ) => void;
	setSelectedColorVariation: ( colorVariation: GlobalStyles | null ) => void;
	setSelectedFontVariation: ( fontVariation: GlobalStyles | null ) => void;
	setGlobalStyles: ( globalStyles?: GlobalStylesObject | null ) => void;
	resetPreview: () => void;
	selectedStyleVariation: StyleVariation | undefined;
	selectedColorVariation: GlobalStyles | null;
	selectedFontVariation: GlobalStyles | null;
}

const UnifiedDesignPickerPreview = ( {
	selectedDesign,
	pickDesign,
	getEventPropsByDesign,
	flow,
	isPremiumThemeAvailable,
	stepName,
	handleSubmit,
	numOfSelectedGlobalStyles,
	previewDesignVariation,
	setSelectedColorVariation,
	setSelectedFontVariation,
	setGlobalStyles,
	resetPreview,
	selectedStyleVariation,
	selectedColorVariation,
	selectedFontVariation,
}: UnifiedDesignPickerPreviewProps ) => {
	const translate = useTranslate();
	const { intent } = useSelect( ( select ) => {
		const onboardStore = select( ONBOARD_STORE ) as OnboardSelect;
		return {
			intent: onboardStore.getIntent(),
		};
	}, [] );
	const { site, siteSlug, siteId, siteSlugOrId } = useSiteData();
	const siteTitle = site?.name;
	const siteDescription = site?.description;
	const { shouldLimitGlobalStyles } = useSiteGlobalStylesStatus( site?.ID );

	// @TODO Cleanup once the test phase is over.
	const isGlobalStylesOnPersonal = useSiteGlobalStylesOnPersonal( site?.ID );

	const wpcomSiteSlug = useSelector( ( state ) => getSiteSlug( state, site?.ID ) );
	const didPurchaseDomain = useSelector(
		( state ) => site?.ID && hasPurchasedDomain( state, site.ID )
	);

	const [ designPreviewPath, setDesignPreviewPath ] = useState< string | undefined >( '/' );

	const [ showEligibility, setShowEligibility ] = useState( false );

	const isJetpack = useSelect(
		( select ) => site && ( select( SITE_STORE ) as SiteSelect ).isJetpackSite( site.ID ),
		[ site ]
	);
	const isAtomic = useSelect(
		( select ) => site && ( select( SITE_STORE ) as SiteSelect ).isSiteAtomic( site.ID ),
		[ site ]
	);

	const shouldUnlockGlobalStyles =
		shouldLimitGlobalStyles && selectedDesign && numOfSelectedGlobalStyles && siteSlugOrId;

	const { data: selectedDesignDetails } = useStarterDesignBySlug( selectedDesign?.slug || '' );

	const styleVariations = selectedDesignDetails?.style_variations ?? [];

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

	const sitePlanSlug = site?.plan?.product_slug;
	const requiredPlanSlug = getRequiredPlan( selectedDesign, sitePlanSlug || '' );

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

	const [ , isGoalsAtFrontExperiment ] = useGoalsFirstExperiment();

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
			plan: requiredPlanSlug === sitePlanSlug ? undefined : requiredPlanSlug,
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

	function handleBackClick() {
		recordTracksEvent(
			'calypso_signup_design_preview_exit',
			getEventPropsByDesign( selectedDesign as Design, {
				styleVariation: selectedStyleVariation,
				colorVariation: selectedColorVariation,
				fontVariation: selectedFontVariation,
			} )
		);

		resetPreview();
	}

	function recordStepContainerTracksEvent( eventName: string ) {
		recordTracksEvent( eventName, {
			step: 'design-setup',
			flow,
			intent,
		} );
	}

	function recordDeviceClick( device: string ) {
		recordTracksEvent( 'calypso_signup_design_preview_device_click', { device } );
	}

	function getPrimaryActionButtonAction(): () => void {
		if ( isGlobalStylesOnPersonal ) {
			if ( isLockedTheme ) {
				return upgradePlan;
			}

			if ( shouldUnlockGlobalStyles ) {
				return unlockPremiumGlobalStyles;
			}

			return pickDesign;
		}

		const isPersonalDesign = selectedDesign?.design_tier === PERSONAL_THEME;
		if ( isLockedTheme ) {
			// For personal themes we favor the GS Upgrade Modal over the Plan Upgrade Modal.
			return isPersonalDesign && shouldUnlockGlobalStyles ? unlockPremiumGlobalStyles : upgradePlan;
		}

		return shouldUnlockGlobalStyles ? unlockPremiumGlobalStyles : pickDesign;
	}

	const isUsingStepContainerV2 = shouldUseStepContainerV2( flow );

	const getPrimaryActionButtonProps = () => {
		const action = getPrimaryActionButtonAction();
		const text =
			action !== pickDesign && ! isGoalsAtFrontExperiment
				? translate( 'Unlock theme' )
				: translate( 'Continue' );

		return {
			action,
			text,
		};
	};

	const { action: primaryActionButtonAction, text: primaryActionButtonText } =
		getPrimaryActionButtonProps();

	const primaryActionButton = isUsingStepContainerV2 ? (
		<Step.PrimaryButton onClick={ () => primaryActionButtonAction() }>
			{ primaryActionButtonText }
		</Step.PrimaryButton>
	) : (
		<Button
			className="navigation-link"
			primary
			borderless={ false }
			onClick={ () => primaryActionButtonAction() }
		>
			{ primaryActionButtonText }
		</Button>
	);

	const screens = useScreens( {
		siteId,
		stylesheet: selectedDesign?.recipe?.stylesheet ?? '',
		isVirtual: selectedDesign?.is_virtual,
		isExternallyManaged: selectedDesign?.is_externally_managed,
		limitGlobalStyles: shouldLimitGlobalStyles,
		variations: styleVariations,
		splitDefaultVariation:
			( isGlobalStylesOnPersonal &&
				selectedDesign?.design_tier === THEME_TIER_FREE &&
				shouldLimitGlobalStyles ) ||
			( ! ( selectedDesign?.design_tier === THEME_TIER_PREMIUM ) &&
				! isBundled &&
				! isPremiumThemeAvailable &&
				shouldLimitGlobalStyles ),
		needsUpgrade: shouldLimitGlobalStyles || isLockedTheme,
		selectedVariation: selectedStyleVariation,
		selectedColorVariation: selectedColorVariation,
		selectedFontVariation: selectedFontVariation,
		onSelectVariation: previewDesignVariation,
		onSelectColorVariation: handleSelectColorVariation,
		onSelectFontVariation: handleSelectFontVariation,
		onScreenSelect: recordDesignPreviewScreenSelect,
		onScreenBack: recordDesignPreviewScreenBack,
		onScreenSubmit: recordDesignPreviewScreenSubmit,
	} );

	/**
	 * This is temporary. It's a way of using the inner navigator from the Design Preview component.
	 *
	 * Since Design Preview is a monolith and it defines the navigator down the tree,
	 * a bigger rewrite would be necessary to wrap Design Preview in a navigator instance.
	 */
	const navigatorRef = useRef< Navigator >( null );

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
					<div>{ primaryActionButton }</div>
				</>
			);
		}

		return primaryActionButton;
	};

	const actionButtons = getActionButtons();

	const designPreviewProps: DesignPreviewProps = {
		navigatorRef,
		previewUrl: themeDemoUrl || previewUrl,
		siteInfo: {
			title: shouldCustomizeText ? site?.name ?? '' : '',
			tagline: shouldCustomizeText ? site?.description ?? '' : '',
		},
		splitDefaultVariation:
			( isGlobalStylesOnPersonal &&
				selectedDesign?.design_tier === THEME_TIER_FREE &&
				shouldLimitGlobalStyles ) ||
			( ! ( selectedDesign?.design_tier === THEME_TIER_PREMIUM ) &&
				! isBundled &&
				! isPremiumThemeAvailable &&
				! didPurchaseSelectedTheme &&
				! isPluginBundleEligible &&
				! isGlobalStylesOnPersonal &&
				shouldLimitGlobalStyles ),
		needsUpgrade: shouldLimitGlobalStyles || isLockedTheme,
		title: headerDesignTitle,
		selectedDesignTitle: designTitle,
		shortDescription: selectedDesign.description,
		description: selectedDesignDetails?.description,
		variations: styleVariations,
		selectedVariation: selectedStyleVariation,
		onSelectVariation: previewDesignVariation,
		actionButtons,
		recordDeviceClick,
		siteId: site?.ID ?? 0,
		stylesheet: selectedDesign.recipe?.stylesheet ?? '',
		screenshot: fullLengthScreenshot,
		isExternallyManaged: selectedDesign.is_externally_managed,
		selectedColorVariation: selectedColorVariation,
		selectedFontVariation: selectedFontVariation,
		onGlobalStylesChange: setGlobalStyles,
		onNavigatorPathChange: ( path?: string ) => setDesignPreviewPath( path ),
		screens,
	};

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
			<DesignPreview { ...designPreviewProps } />
		</>
	);

	const activeScreen = screens.find( ( screen ) => screen.path === designPreviewPath );

	if ( isUsingStepContainerV2 ) {
		// TODO: Create a new wireframe for the design preview. It should be named "FixedColumnOnTheLeftLayout"
		return (
			<Step.WideLayout
				maxWidth="xhuge"
				className="step-container-v2--design-picker-preview"
				topBar={ ( { isLargeViewport } ) => {
					if ( ! isLargeViewport && activeScreen ) {
						return null;
					}

					return (
						<Step.TopBar
							leftElement={ ! activeScreen && <Step.BackButton onClick={ handleBackClick } /> }
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
							leftElement={
								( activeScreen || styleVariations.length > 0 ) && (
									<Step.BackButton
										enableTracksEvent={ ! activeScreen }
										onClick={ () => {
											if ( activeScreen?.onBack ) {
												navigatorRef.current?.goBack();
												return activeScreen.onBack( activeScreen.slug );
											}

											return handleBackClick();
										} }
									/>
								)
							}
							centerElement={
								activeScreen && (
									<div className="step-container-v2--design-picker-preview__header-design-title">
										{ headerDesignTitle }
									</div>
								)
							}
							rightElement={
								<Step.PrimaryButton
									onClick={ () => {
										if ( activeScreen?.onSubmit ) {
											navigatorRef.current?.goBack();
											return activeScreen.onSubmit( activeScreen.slug );
										}

										return primaryActionButtonAction();
									} }
								>
									{ activeScreen?.actionText ?? primaryActionButtonText }
								</Step.PrimaryButton>
							}
						/>
					);
				} }
			>
				{ stepContent }
			</Step.WideLayout>
		);
	}

	return (
		<StepContainer
			stepName={ STEP_NAME }
			stepContent={ stepContent }
			hideSkip={ ! isGoalsAtFrontExperiment }
			skipLabelText={ translate( 'Skip setup' ) }
			skipButtonAlign="top"
			hideBack={ !! activeScreen }
			className="design-setup__preview design-setup__preview__has-more-info"
			goBack={ handleBackClick }
			customizedActionButtons={ ! activeScreen ? actionButtons : undefined }
			recordTracksEvent={ recordStepContainerTracksEvent }
		/>
	);
};

export default UnifiedDesignPickerPreview;
