import { isEnabled } from '@automattic/calypso-config';
import { WPCOM_FEATURES_PREMIUM_THEMES } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { Onboard, useStarterDesignBySlug, useStarterDesignsQuery } from '@automattic/data-stores';
import {
	UnifiedDesignPicker,
	useCategorizationFromApi,
	getDesignPreviewUrl,
	isBlankCanvasDesign,
	BLANK_CANVAS_DESIGN,
} from '@automattic/design-picker';
import { useLocale } from '@automattic/i18n-utils';
import { StepContainer } from '@automattic/onboarding';
import { useViewportMatch } from '@wordpress/compose';
import { useSelect, useDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { useRef, useState, useEffect } from 'react';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import { useQuerySitePurchases } from 'calypso/components/data/query-site-purchases';
import FormattedHeader from 'calypso/components/formatted-header';
import PremiumGlobalStylesUpgradeModal from 'calypso/components/premium-global-styles-upgrade-modal';
import WebPreview from 'calypso/components/web-preview/content';
import { ActiveTheme } from 'calypso/data/themes/use-active-theme-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { urlToSlug } from 'calypso/lib/url';
import { usePremiumGlobalStyles } from 'calypso/state/sites/hooks/use-premium-global-styles';
import { setActiveTheme } from 'calypso/state/themes/actions';
import { getPurchasedThemes } from 'calypso/state/themes/selectors/get-purchased-themes';
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
import { DEFAULT_VARIATION_SLUG, RETIRING_DESIGN_SLUGS, STEP_NAME } from './constants';
import DesignPickerDesignTitle from './design-picker-design-title';
import PreviewToolbar from './preview-toolbar';
import UpgradeModal from './upgrade-modal';
import getThemeIdFromDesign from './utils/get-theme-id-from-design';
import type { Step, ProvidedDependencies } from '../../types';
import './style.scss';
import type { OnboardSelect, SiteSelect, StarterDesigns } from '@automattic/data-stores';
import type { Design, StyleVariation } from '@automattic/design-picker';

const SiteIntent = Onboard.SiteIntent;
const SITE_ASSEMBLER_AVAILABLE_INTENTS: string[] = [ SiteIntent.Build, SiteIntent.Write ];

const UnifiedDesignPickerStep: Step = ( { navigation, flow, stepName } ) => {
	const queryParams = useQuery();
	const { goBack, submit, exitFlow } = navigation;

	const reduxDispatch = useReduxDispatch();

	const translate = useTranslate();
	const locale = useLocale();

	const isMobile = ! useViewportMatch( 'small' );
	const isDesktop = useViewportMatch( 'large' );

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
				design.style_variations = design.style_variations.filter(
					( variation ) => variation.slug === 'default'
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

	const [ isPreviewingDesign, setIsPreviewingDesign ] = useState( false );

	// Make sure people is at the top when entering/leaving preview mode.
	useEffect( () => {
		window.scrollTo( { top: 0 } );
	}, [ isPreviewingDesign ] );

	const selectedDesign = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedDesign(),
		[]
	);
	const { setSelectedDesign } = useDispatch( ONBOARD_STORE );

	const selectedDesignHasStyleVariations = ( selectedDesign?.style_variations || [] ).length > 0;
	const { data: selectedDesignDetails } = useStarterDesignBySlug( selectedDesign?.slug || '', {
		enabled: isPreviewingDesign && selectedDesignHasStyleVariations,
	} );

	if ( isDesignFirstFlow && selectedDesignDetails?.style_variations ) {
		selectedDesignDetails.style_variations = selectedDesignDetails?.style_variations[ 0 ];
	}

	const selectedStyleVariation = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedStyleVariation(),
		[]
	);
	const { setSelectedStyleVariation } = useDispatch( ONBOARD_STORE );

	// Unset the selected design, thus restarting the design picking experience.
	useEffect( () => {
		setSelectedDesign( undefined );
		setSelectedStyleVariation( undefined );
	}, [] );

	// When the theme or style query strings parameters are present,
	// automatically switch to previewing that theme (if it's a valid theme)
	// and that style variation (if it's a valid style variation).
	const themeFromQueryString = queryParams.get( 'theme' );
	const styleFromQueryString = queryParams.get( 'style' );
	const hideBackFromQueryString = queryParams.get( 'hideBack' );

	useEffect( () => {
		if ( ! themeFromQueryString || ! allDesigns ) {
			return;
		}

		const { designs } = allDesigns;
		const requestedDesign = designs.find( ( design ) => design.slug === themeFromQueryString );
		if ( ! requestedDesign ) {
			return;
		}

		if ( styleFromQueryString ) {
			const requestedStyleVariation = requestedDesign.style_variations?.find(
				( styleVariation ) => styleVariation.slug === styleFromQueryString
			);

			setSelectedStyleVariation( requestedStyleVariation );
		}

		setSelectedDesign( requestedDesign );
		setIsPreviewingDesign( true );
	}, [
		themeFromQueryString,
		styleFromQueryString,
		allDesigns,
		setSelectedDesign,
		setSelectedStyleVariation,
	] );

	function getEventPropsByDesign( design: Design, styleVariation?: StyleVariation ) {
		return {
			...getDesignEventProps( { flow, intent, design, styleVariation } ),
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

	function previewDesign( design: Design, styleVariation?: StyleVariation ) {
		// Virtual designs don't need to be previewed and can go directly to the site assembler.
		const shouldGoToAssembler =
			design.is_virtual && design.slug === BLANK_CANVAS_DESIGN.slug && isDesktop;

		if ( shouldGoToAssembler ) {
			design = {
				...design,
				design_type: BLANK_CANVAS_DESIGN.design_type,
			} as Design;
		}

		recordPreviewedDesign( { flow, intent, design, styleVariation } );

		if ( shouldGoToAssembler ) {
			pickDesign( design );
			return;
		}

		setSelectedDesign( design );
		if ( styleVariation ) {
			setSelectedStyleVariation( styleVariation );
		}

		setIsPreviewingDesign( true );
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

	function previewDesignVariation( variation: StyleVariation ) {
		recordTracksEvent(
			'calypso_signup_design_preview_style_variation_preview_click',
			getEventPropsByDesign( selectedDesign as Design, variation )
		);

		setSelectedStyleVariation( variation );
	}

	// ********** Logic for unlocking a selected premium design

	useQuerySitePurchases( site ? site.ID : -1 );

	const purchasedThemes = useSelector( ( state ) =>
		site ? getPurchasedThemes( state, site.ID ) : []
	);
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
			// When the user is done with checkout, send them back to the current url
			const destUrl = new URL( window.location.href );
			const destSearchP = destUrl.searchParams;

			// If we have a theme selected, add &theme=slug to the query params
			if ( selectedDesign?.slug ) {
				destSearchP.set( 'theme', selectedDesign?.slug );
				destUrl.search = destSearchP.toString();
			}

			const destString = destUrl.toString().replace( window.location.origin, '' );

			goToCheckout( {
				flowName: flow,
				stepName,
				siteSlug: siteSlug || urlToSlug( site?.URL || '' ) || '',
				destination: destString,
				plan,
			} );

			setShowUpgradeModal( false );
		}
	}

	// ********** Logic for Premium Global Styles
	const [ showPremiumGlobalStylesModal, setShowPremiumGlobalStylesModal ] = useState( false );

	function unlockPremiumGlobalStyles() {
		// These conditions should be true at this point, but just in case...
		if ( selectedDesign && selectedStyleVariation ) {
			recordTracksEvent(
				'calypso_signup_design_global_styles_gating_modal_show',
				getEventPropsByDesign( selectedDesign, selectedStyleVariation )
			);
			setShowPremiumGlobalStylesModal( true );
		}
	}

	function closePremiumGlobalStylesModal() {
		// These conditions should be true at this point, but just in case...
		if ( selectedDesign && selectedStyleVariation ) {
			recordTracksEvent(
				'calypso_signup_design_global_styles_gating_modal_close_button_click',
				getEventPropsByDesign( selectedDesign, selectedStyleVariation )
			);
			setShowPremiumGlobalStylesModal( false );
		}
	}

	function handleCheckoutForPremiumGlobalStyles() {
		// These conditions should be true at this point, but just in case...
		if ( selectedDesign && selectedStyleVariation && siteSlugOrId ) {
			recordTracksEvent(
				'calypso_signup_design_global_styles_gating_modal_checkout_button_click',
				getEventPropsByDesign( selectedDesign, selectedStyleVariation )
			);

			// When the user is done with checkout, send them back to the current url
			const destUrl = new URL( window.location.href );
			const destSearchP = destUrl.searchParams;

			// Add &theme=theme_slug&style=style_slug to the query params
			if ( selectedDesign.slug && selectedStyleVariation.slug ) {
				destSearchP.set( 'theme', selectedDesign.slug );
				destSearchP.set( 'style', selectedStyleVariation.slug );
				destUrl.search = destSearchP.toString();
			}

			const destString = destUrl.toString().replace( window.location.origin, '' );

			goToCheckout( {
				flowName: flow,
				stepName,
				siteSlug: siteSlug || urlToSlug( site?.URL || '' ) || '',
				destination: destString,
				plan: 'premium',
			} );

			setShowPremiumGlobalStylesModal( false );
		}
	}

	function tryPremiumGlobalStyles() {
		// These conditions should be true at this point, but just in case...
		if ( selectedDesign && selectedStyleVariation ) {
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

	function pickDesign( _selectedDesign: Design | undefined = selectedDesign ) {
		setSelectedDesign( _selectedDesign );
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

			setSelectedDesign( undefined );
			setSelectedStyleVariation( undefined );
			setIsPreviewingDesign( false );
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
			if (
				shouldLimitGlobalStyles &&
				selectedStyleVariation &&
				selectedStyleVariation.slug !== DEFAULT_VARIATION_SLUG
			) {
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
				{ selectedDesignHasStyleVariations && (
					<div className="action-buttons__title">{ headerDesignTitle }</div>
				) }
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
				{ selectedDesignHasStyleVariations ? (
					<AsyncLoad
						require="@automattic/design-preview"
						placeholder={ null }
						previewUrl={ previewUrl }
						title={ headerDesignTitle }
						description={ selectedDesign.description }
						variations={ selectedDesignDetails?.style_variations }
						selectedVariation={ selectedStyleVariation }
						onSelectVariation={ previewDesignVariation }
						actionButtons={ actionButtons }
						recordDeviceClick={ recordDeviceClick }
						showGlobalStylesPremiumBadge={ shouldLimitGlobalStyles }
					/>
				) : (
					<WebPreview
						showPreview
						showClose={ false }
						showEdit={ false }
						externalUrl={ siteSlug }
						showExternal={ true }
						previewUrl={ previewUrl }
						loadingMessage={ translate(
							'{{strong}}One moment, please…{{/strong}} loading your site.',
							{
								components: { strong: <strong /> },
							}
						) }
						toolbarComponent={ PreviewToolbar }
						siteId={ site?.ID }
						url={ site?.URL }
						translate={ translate }
						recordTracksEvent={ recordTracksEvent }
					/>
				) }
			</>
		);

		return selectedDesignHasStyleVariations ? (
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
		) : (
			<StepContainer
				stepName={ STEP_NAME }
				stepContent={ stepContent }
				hideSkip
				hideBack={ !! hideBackFromQueryString }
				className="design-setup__preview"
				goBack={ handleBackClick }
				goNext={ () => pickDesign() }
				formattedHeader={
					<FormattedHeader
						id="design-setup-header"
						headerText={ headerDesignTitle }
						align={ isMobile ? 'left' : 'center' }
					/>
				}
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

	const currentPlanFeatures = site?.plan?.features.active ?? [];

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
			purchasedThemes={ purchasedThemes }
			currentPlanFeatures={ currentPlanFeatures }
			shouldLimitGlobalStyles={ shouldLimitGlobalStyles }
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
