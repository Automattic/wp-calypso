import { isEnabled } from '@automattic/calypso-config';
import { WPCOM_FEATURES_PREMIUM_THEMES } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import {
	Onboard,
	updateLaunchpadSettings,
	useStarterDesignBySlug,
	useStarterDesignsQuery,
} from '@automattic/data-stores';
import {
	isDefaultGlobalStylesVariationSlug,
	UnifiedDesignPicker,
	useCategorizationFromApi,
	getDesignPreviewUrl,
	isBlankCanvasDesign,
} from '@automattic/design-picker';
import { useLocale } from '@automattic/i18n-utils';
import { StepContainer } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState, useEffect } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import { useQuerySiteFeatures } from 'calypso/components/data/query-site-features';
import { useQuerySitePurchases } from 'calypso/components/data/query-site-purchases';
import { useQueryThemes } from 'calypso/components/data/query-themes';
import FormattedHeader from 'calypso/components/formatted-header';
import PremiumGlobalStylesUpgradeModal from 'calypso/components/premium-global-styles-upgrade-modal';
import ThemeTypeBadge from 'calypso/components/theme-type-badge';
import { ActiveTheme } from 'calypso/data/themes/use-active-theme-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { urlToSlug } from 'calypso/lib/url';
import { useDispatch as useReduxDispatch, useSelector } from 'calypso/state';
import { usePremiumGlobalStyles } from 'calypso/state/sites/hooks/use-premium-global-styles';
import { setActiveTheme } from 'calypso/state/themes/actions';
import { isThemePurchased } from 'calypso/state/themes/selectors/is-theme-purchased';
import useCheckout from '../../../../hooks/use-checkout';
import { useIsPluginBundleEligible } from '../../../../hooks/use-is-plugin-bundle-eligible';
import { useQuery } from '../../../../hooks/use-query';
import { useSite } from '../../../../hooks/use-site';
import { useSiteIdParam } from '../../../../hooks/use-site-id-param';
import { useSiteSlugParam } from '../../../../hooks/use-site-slug-param';
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
import { RETIRING_DESIGN_SLUGS, STEP_NAME } from './constants';
import DesignPickerDesignTitle from './design-picker-design-title';
import useRecipe from './hooks/use-recipe';
import UpgradeModal from './upgrade-modal';
import getThemeIdFromDesign from './utils/get-theme-id-from-design';
import type { Step, ProvidedDependencies } from '../../types';
import './style.scss';
import type { OnboardSelect, SiteSelect, StarterDesigns } from '@automattic/data-stores';
import type { Design, StyleVariation } from '@automattic/design-picker';
import type { GlobalStylesObject } from '@automattic/global-styles';

const SiteIntent = Onboard.SiteIntent;
const SITE_ASSEMBLER_AVAILABLE_INTENTS: string[] = [ SiteIntent.Build, SiteIntent.Write ];

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

	const site = useSite();
	const siteSlug = useSiteSlugParam();
	const siteId = useSiteIdParam();
	const siteSlugOrId = siteSlug ? siteSlug : siteId;
	const siteTitle = site?.name;
	const siteDescription = site?.description;
	const { shouldLimitGlobalStyles } = usePremiumGlobalStyles( site?.ID );
	const isDesignFirstFlow = queryParams.get( 'flowToReturnTo' ) === 'design-first';
	const hideBackFromQueryString = queryParams.get( 'hideBack' );

	const { goToCheckout } = useCheckout();

	const isAtomic = useSelect(
		( select ) => site && ( select( SITE_STORE ) as SiteSelect ).isSiteAtomic( site.ID ),
		[ site ]
	);
	useEffect( () => {
		if ( isAtomic ) {
			exitFlow?.( `/site-editor/${ siteSlugOrId }` );
		}
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
		allDesigns.designs = allDesigns.designs.filter(
			( design ) => RETIRING_DESIGN_SLUGS.indexOf( design.slug ) === -1
		);

		const blankCanvasDesignOffset = allDesigns.designs.findIndex( isBlankCanvasDesign );
		if ( blankCanvasDesignOffset !== -1 ) {
			// Extract the blank canvas design first and then insert it into the last one for the build and write intents
			const blankCanvasDesign = allDesigns.designs.splice( blankCanvasDesignOffset, 1 );
			if (
				isEnabled( 'signup/design-picker-pattern-assembler' ) &&
				SITE_ASSEMBLER_AVAILABLE_INTENTS.includes( intent )
			) {
				allDesigns.designs.push( ...blankCanvasDesign );
			}
		}

		if ( isDesignFirstFlow ) {
			allDesigns.designs = allDesigns.designs.filter( ( design ) => design.is_premium === false );

			allDesigns.designs = allDesigns.designs.map( ( design ) => {
				design.style_variations = design.style_variations?.filter( ( variation ) =>
					isDefaultGlobalStylesVariationSlug( variation.slug )
				);
				return design;
			} );
		}

		return allDesigns;
	};

	const { data: allDesigns, isLoading: isLoadingDesigns } = useStarterDesignsQuery(
		{
			seed: siteSlugOrId || undefined,
			_locale: locale,
		},
		{
			enabled: true,
			select: selectStarterDesigns,
		}
	);

	const designs = allDesigns?.designs || [];
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
		selectedFontVariation,
		hasSelectedGlobalStyles,
		globalStyles,
		setSelectedDesign,
		previewDesign,
		previewDesignVariation,
		setSelectedFontVariation,
		setGlobalStyles,
		resetPreview,
	} = useRecipe(
		site?.ID,
		allDesigns,
		pickDesign,
		recordPreviewDesign,
		recordPreviewStyleVariation
	);

	// Make sure people is at the top when entering/leaving preview mode.
	useEffect( () => {
		window.scrollTo( { top: 0 } );
	}, [ isPreviewingDesign ] );

	const selectedDesignHasStyleVariations = ( selectedDesign?.style_variations || [] ).length > 0;
	const { data: selectedDesignDetails } = useStarterDesignBySlug( selectedDesign?.slug || '', {
		enabled: isPreviewingDesign && selectedDesignHasStyleVariations,
		select: ( design: Design ) => {
			if ( isDesignFirstFlow && selectedDesignDetails?.style_variations ) {
				design.style_variations = [];
			}

			return design;
		},
	} );

	function getEventPropsByDesign(
		design: Design,
		styleVariation?: StyleVariation,
		fontVariation?: GlobalStylesObject | null
	) {
		return {
			...getDesignEventProps( { flow, intent, design, styleVariation, fontVariation } ),
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
			getEventPropsByDesign( design, styleVariation )
		);
	}

	function onChangeVariation( design: Design, styleVariation?: StyleVariation ) {
		recordTracksEvent( 'calypso_signup_design_picker_style_variation_button_click', {
			...getEventPropsByDesign( design, styleVariation ),
			...getVirtualDesignProps( design ),
		} );
	}

	function trackAllDesignsView() {
		recordTracksEvent( 'calypso_signup_design_scrolled_to_end', {
			intent,
			category: categorization?.selection,
		} );
	}

	// ********** Logic for unlocking a selected premium design

	useQueryThemes( 'wpcom', { tier: '-marketplace', number: 1000 } );
	useQuerySitePurchases( site ? site.ID : -1 );
	useQuerySiteFeatures( [ site?.ID ] );

	const selectedDesignThemeId = selectedDesign ? getThemeIdFromDesign( selectedDesign ) : null;
	const didPurchaseSelectedTheme = useSelector( ( state ) =>
		site && selectedDesignThemeId
			? isThemePurchased( state, selectedDesignThemeId, site.ID )
			: false
	);

	const isPluginBundleEligible = useIsPluginBundleEligible();
	const isBundledWithWooCommerce = selectedDesign?.is_bundled_with_woo_commerce;

	const shouldUpgrade =
		( selectedDesign?.is_premium && ! isPremiumThemeAvailable && ! didPurchaseSelectedTheme ) ||
		( ! isPluginBundleEligible && isBundledWithWooCommerce );

	const [ showUpgradeModal, setShowUpgradeModal ] = useState( false );

	const isEligibleForProPlan = useSelect(
		( select ) => site && ( select( SITE_STORE ) as SiteSelect ).isEligibleForProPlan( site.ID ),
		[ site ]
	);

	const getBadge = (
		themeId: string,
		forcePremium: boolean,
		tooltipHeader: string,
		tooltipMessage: string
	) => (
		<ThemeTypeBadge
			canGoToCheckout={ false }
			forcePremium={ forcePremium }
			siteId={ site?.ID ?? null }
			siteSlug={ siteSlug }
			themeId={ themeId }
			tooltipHeader={ tooltipHeader }
			tooltipMessage={ tooltipMessage }
		/>
	);

	function upgradePlan() {
		if ( selectedDesign ) {
			recordTracksEvent(
				'calypso_signup_design_preview_unlock_theme_click',
				getEventPropsByDesign( selectedDesign, selectedStyleVariation )
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

	function handleCheckout() {
		recordTracksEvent( 'calypso_signup_design_upgrade_modal_checkout_button_click', {
			theme: selectedDesign?.slug,
		} );

		const themeHasWooCommerce = selectedDesign?.software_sets?.find(
			( set ) => set.slug === 'woo-on-plans'
		);

		let plan;
		if ( themeHasWooCommerce ) {
			plan = 'business-bundle';
		} else {
			plan = isEligibleForProPlan && isEnabled( 'plans/pro-plan' ) ? 'pro' : 'premium';
		}

		if ( siteSlugOrId ) {
			goToCheckout( {
				flowName: flow,
				stepName,
				siteSlug: siteSlug || urlToSlug( site?.URL || '' ) || '',
				// When the user is done with checkout, send them back to the current url
				destination: window.location.href.replace( window.location.origin, '' ),
				plan,
			} );

			setShowUpgradeModal( false );
		}
	}

	// ********** Logic for Premium Global Styles
	const [ showPremiumGlobalStylesModal, setShowPremiumGlobalStylesModal ] = useState( false );

	function unlockPremiumGlobalStyles() {
		// These conditions should be true at this point, but just in case...
		if ( selectedDesign && hasSelectedGlobalStyles ) {
			recordTracksEvent(
				'calypso_signup_design_global_styles_gating_modal_show',
				getEventPropsByDesign( selectedDesign, selectedStyleVariation )
			);
			setShowPremiumGlobalStylesModal( true );
		}
	}

	function closePremiumGlobalStylesModal() {
		// These conditions should be true at this point, but just in case...
		if ( selectedDesign && hasSelectedGlobalStyles ) {
			recordTracksEvent(
				'calypso_signup_design_global_styles_gating_modal_close_button_click',
				getEventPropsByDesign( selectedDesign, selectedStyleVariation )
			);
			setShowPremiumGlobalStylesModal( false );
		}
	}

	function handleCheckoutForPremiumGlobalStyles() {
		// These conditions should be true at this point, but just in case...
		if ( selectedDesign && hasSelectedGlobalStyles && siteSlugOrId ) {
			recordTracksEvent(
				'calypso_signup_design_global_styles_gating_modal_checkout_button_click',
				getEventPropsByDesign( selectedDesign, selectedStyleVariation )
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
		if ( selectedDesign && hasSelectedGlobalStyles ) {
			recordTracksEvent(
				'calypso_signup_design_global_styles_gating_modal_try_button_click',
				getEventPropsByDesign( selectedDesign, selectedStyleVariation )
			);
			pickDesign();
		}
	}

	// ********** Logic for submitting the selected design

	const { setDesignOnSite, applyThemeWithPatterns } = useDispatch( SITE_STORE );
	const { setPendingAction } = useDispatch( ONBOARD_STORE );

	async function pickDesign( _selectedDesign: Design | undefined = selectedDesign ) {
		setSelectedDesign( _selectedDesign );

		await updateLaunchpadSettings( siteSlug, {
			checklist_statuses: { design_completed: true },
		} );

		if ( siteSlugOrId && _selectedDesign ) {
			const positionIndex = designs.findIndex(
				( design ) => design.slug === _selectedDesign?.slug
			);

			setPendingAction( () => {
				if ( _selectedDesign?.is_virtual ) {
					return applyThemeWithPatterns( siteSlugOrId, _selectedDesign ).then(
						( theme: ActiveTheme ) => reduxDispatch( setActiveTheme( site?.ID || -1, theme ) )
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

	function pickBlankCanvasDesign( blankCanvasDesign: Design, shouldGoToAssemblerStep: boolean ) {
		if ( shouldGoToAssemblerStep ) {
			const _selectedDesign = {
				...blankCanvasDesign,
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
			} );
		} else {
			pickDesign( blankCanvasDesign );
		}
	}

	function handleSubmit( providedDependencies?: ProvidedDependencies, optionalProps?: object ) {
		const _selectedDesign = providedDependencies?.selectedDesign as Design;
		if ( _selectedDesign?.design_type !== 'assembler' ) {
			recordSelectedDesign( {
				flow,
				intent,
				design: _selectedDesign,
				styleVariation: selectedStyleVariation,
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
				getEventPropsByDesign( selectedDesign as Design, selectedStyleVariation )
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
		if ( shouldUpgrade ) {
			return (
				<Button primary borderless={ false } onClick={ upgradePlan }>
					{ translate( 'Unlock theme' ) }
				</Button>
			);
		}

		const selectStyle = () => {
			if ( shouldLimitGlobalStyles && hasSelectedGlobalStyles ) {
				unlockPremiumGlobalStyles();
			} else {
				pickDesign();
			}
		};

		return (
			<Button primary borderless={ false } onClick={ selectStyle }>
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
					closeModal={ closeUpgradeModal }
					checkout={ handleCheckout }
				/>
				<PremiumGlobalStylesUpgradeModal
					checkout={ handleCheckoutForPremiumGlobalStyles }
					closeModal={ closePremiumGlobalStylesModal }
					isOpen={ showPremiumGlobalStylesModal }
					tryStyle={ tryPremiumGlobalStyles }
				/>
				<AsyncLoad
					require="@automattic/design-preview"
					placeholder={ null }
					previewUrl={ previewUrl }
					splitPremiumVariations={
						! selectedDesign.is_premium &&
						! isBundledWithWooCommerce &&
						! isPremiumThemeAvailable &&
						! didPurchaseSelectedTheme &&
						! isPluginBundleEligible
					}
					title={ headerDesignTitle }
					description={ ! selectedDesign.is_virtual && selectedDesign.description }
					variations={
						selectedDesignHasStyleVariations ? selectedDesignDetails?.style_variations : []
					}
					selectedVariation={ selectedStyleVariation }
					onSelectVariation={ previewDesignVariation }
					actionButtons={ actionButtons }
					recordDeviceClick={ recordDeviceClick }
					siteId={ site.ID }
					stylesheet={ selectedDesign.recipe?.stylesheet }
					selectedFontVariation={ selectedFontVariation }
					onSelectFontVariation={ setSelectedFontVariation }
					onGlobalStylesChange={ setGlobalStyles }
				/>
			</>
		);

		return (
			<StepContainer
				stepName={ STEP_NAME }
				stepContent={ stepContent }
				hideSkip
				hideBack={ !! hideBackFromQueryString }
				className="design-setup__preview design-setup__preview__has-more-info"
				goBack={ handleBackClick }
				customizedActionButtons={ actionButtons }
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
			onSelectBlankCanvas={ pickBlankCanvasDesign }
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
			backLabelText={ translate( 'Back' ) }
			skipLabelText={
				intent === SiteIntent.Write
					? translate( 'Skip and draft first post' )
					: translate( 'Skip for now' )
			}
			stepContent={ stepContent }
			recordTracksEvent={ recordStepContainerTracksEvent }
			goNext={ handleSubmit }
			goBack={ handleBackClick }
		/>
	);
};

export default UnifiedDesignPickerStep;
