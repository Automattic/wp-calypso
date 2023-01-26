import { isEnabled } from '@automattic/calypso-config';
import { WPCOM_FEATURES_PREMIUM_THEMES } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { Onboard, useStarterDesignBySlug, useStarterDesignsQuery } from '@automattic/data-stores';
import {
	UnifiedDesignPicker,
	useCategorization,
	getDesignPreviewUrl,
	isBlankCanvasDesign,
} from '@automattic/design-picker';
import { useLocale } from '@automattic/i18n-utils';
import { StepContainer } from '@automattic/onboarding';
import { useViewportMatch } from '@wordpress/compose';
import { useSelect, useDispatch } from '@wordpress/data';
import { useTranslate } from 'i18n-calypso';
import { ReactChild, useRef, useState, useEffect } from 'react';
import { useDispatch as useReduxDispatch, useSelector } from 'react-redux';
import AsyncLoad from 'calypso/components/async-load';
import { useQuerySitePurchases } from 'calypso/components/data/query-site-purchases';
import FormattedHeader from 'calypso/components/formatted-header';
import PremiumGlobalStylesUpgradeModal from 'calypso/components/premium-global-styles-upgrade-modal';
import WebPreview from 'calypso/components/web-preview/content';
import { useSiteVerticalQueryById } from 'calypso/data/site-verticals';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { urlToSlug } from 'calypso/lib/url';
import { usePremiumGlobalStyles } from 'calypso/state/sites/hooks/use-premium-global-styles';
import { requestActiveTheme } from 'calypso/state/themes/actions';
import { getPurchasedThemes } from 'calypso/state/themes/selectors/get-purchased-themes';
import { isThemePurchased } from 'calypso/state/themes/selectors/is-theme-purchased';
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
} from '../../analytics/record-design';
import { getCategorizationOptions } from './categories';
import { DEFAULT_VARIATION_SLUG, RETIRING_DESIGN_SLUGS, STEP_NAME } from './constants';
import DesignPickerDesignTitle from './design-picker-design-title';
import PreviewToolbar from './preview-toolbar';
import UpgradeModal from './upgrade-modal';
import getThemeIdFromDesign from './utils/get-theme-id-from-design';
import type { Step, ProvidedDependencies } from '../../types';
import './style.scss';
import type { StarterDesigns } from '@automattic/data-stores';
import type { Design, StyleVariation } from '@automattic/design-picker';

const SiteIntent = Onboard.SiteIntent;

const UnifiedDesignPickerStep: Step = ( { navigation, flow } ) => {
	const { goBack, submit, exitFlow } = navigation;

	const reduxDispatch = useReduxDispatch();

	const translate = useTranslate();
	const locale = useLocale();

	const isMobile = ! useViewportMatch( 'small' );

	const intent = useSelect( ( select ) => select( ONBOARD_STORE ).getIntent() );

	const site = useSite();
	const siteSlug = useSiteSlugParam();
	const siteId = useSiteIdParam();
	const siteSlugOrId = siteSlug ? siteSlug : siteId;
	const siteTitle = site?.name;
	const siteDescription = site?.description;
	const siteVerticalId = useSelect(
		( select ) => ( site && select( SITE_STORE ).getSiteVerticalId( site.ID ) ) || ''
	);

	const isAtomic = useSelect( ( select ) => site && select( SITE_STORE ).isSiteAtomic( site.ID ) );
	useEffect( () => {
		if ( isAtomic ) {
			exitFlow?.( `/site-editor/${ siteSlugOrId }` );
		}
	}, [ isAtomic ] );

	const isPremiumThemeAvailable = Boolean(
		useSelect(
			( select ) =>
				site && select( SITE_STORE ).siteHasFeature( site.ID, WPCOM_FEATURES_PREMIUM_THEMES )
		)
	);

	// ********** Logic for vertical
	const { data: siteVertical, isLoading: isLoadingSiteVertical } =
		useSiteVerticalQueryById( siteVerticalId );

	// ********** Logic for fetching designs
	const selectStarterDesigns = ( allDesigns: StarterDesigns ) => {
		allDesigns.static.designs = allDesigns.static.designs.filter(
			( design ) => RETIRING_DESIGN_SLUGS.indexOf( design.slug ) === -1
		);

		const blankCanvasDesignOffset = allDesigns.static.designs.findIndex( isBlankCanvasDesign );
		if ( blankCanvasDesignOffset !== -1 ) {
			// Extract the blank canvas design first and then insert it into the last one for the build intent
			const blankCanvasDesign = allDesigns.static.designs.splice( blankCanvasDesignOffset, 1 );
			if ( isEnabled( 'signup/design-picker-pattern-assembler' ) && intent === SiteIntent.Build ) {
				allDesigns.static.designs.push( ...blankCanvasDesign );
			}
		}

		return allDesigns;
	};

	const { data: allDesigns, isLoading: isLoadingDesigns } = useStarterDesignsQuery(
		{
			vertical_id: siteVerticalId,
			intent,
			seed: siteSlugOrId || undefined,
			_locale: locale,
		},
		{
			enabled: true,
			select: selectStarterDesigns,
		}
	);

	const generatedDesigns = allDesigns?.generated?.designs || [];
	const staticDesigns = allDesigns?.static?.designs || [];

	const hasTrackedView = useRef( false );
	useEffect( () => {
		if ( ! hasTrackedView.current && staticDesigns.length > 0 ) {
			hasTrackedView.current = true;
			recordTracksEvent( 'calypso_signup_unified_design_picker_view', {
				vertical_id: siteVerticalId,
				generated_designs: generatedDesigns.map( ( design ) => design.slug ).join( ',' ),
				has_vertical_images:
					generatedDesigns.some( ( design ) => design.verticalizable ) ||
					staticDesigns.some( ( design ) => design.verticalizable ),
			} );
		}
	}, [ hasTrackedView, generatedDesigns, staticDesigns ] );

	const categorizationOptions = getCategorizationOptions(
		intent,
		true,
		generatedDesigns.length > 0 ? siteVertical?.title : undefined
	);

	const categorization = useCategorization( staticDesigns, categorizationOptions );

	// ********** Logic for selecting a design and style variation

	const [ isPreviewingDesign, setIsPreviewingDesign ] = useState( false );

	// Make sure people is at the top when entering/leaving preview mode.
	useEffect( () => {
		window.scrollTo( { top: 0 } );
	}, [ isPreviewingDesign ] );

	const selectedDesign = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedDesign() );
	const { setSelectedDesign } = useDispatch( ONBOARD_STORE );

	const selectedDesignHasStyleVariations = ( selectedDesign?.style_variations || [] ).length > 0;
	const { data: selectedDesignDetails } = useStarterDesignBySlug( selectedDesign?.slug || '', {
		enabled: isPreviewingDesign && selectedDesignHasStyleVariations,
	} );

	const selectedStyleVariation = useSelect( ( select ) =>
		select( ONBOARD_STORE ).getSelectedStyleVariation()
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
	const queryParams = useQuery();
	const themeFromQueryString = queryParams.get( 'theme' );
	const styleFromQueryString = queryParams.get( 'style' );

	useEffect( () => {
		if ( ! themeFromQueryString || ! allDesigns ) {
			return;
		}

		const { generated: generatedDesigns, static: staticDesigns } = allDesigns;

		const designs = [ ...generatedDesigns.designs, ...staticDesigns.designs ];

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
		recordPreviewedDesign( { flow, intent, design, styleVariation } );
		setSelectedDesign( design );

		if ( styleVariation ) {
			recordTracksEvent(
				'calypso_signup_design_picker_style_variation_button_click',
				getEventPropsByDesign( design, styleVariation )
			);
			setSelectedStyleVariation( styleVariation );
		}

		setIsPreviewingDesign( true );
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
		( select ) => site && select( SITE_STORE ).isEligibleForProPlan( site.ID )
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

	function goToCheckout() {
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
			const params = new URLSearchParams();

			// When the user is done with checkout, send them back to the current url
			const destUrl = new URL( window.location.href );
			const destSearchP = destUrl.searchParams;

			// If we have a theme selected, add &theme=slug to the query params
			if ( selectedDesign?.slug ) {
				destSearchP.set( 'theme', selectedDesign?.slug );
				destUrl.search = destSearchP.toString();
			}

			const destString = destUrl.toString().replace( window.location.origin, '' );
			params.append( 'redirect_to', destString );

			// The theme upsell link does not work with siteId and requires a siteSlug.
			// See https://github.com/Automattic/wp-calypso/pull/64899
			window.location.href = `/checkout/${ encodeURIComponent(
				siteSlug || urlToSlug( site?.URL || '' ) || ''
			) }/${ plan }?${ params.toString() }`;
		}
	}

	// ********** Logic for Premium Global Styles

	const { shouldLimitGlobalStyles } = usePremiumGlobalStyles();
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

	function goToCheckoutForPremiumGlobalStyles() {
		// These conditions should be true at this point, but just in case...
		if ( selectedDesign && selectedStyleVariation && siteSlugOrId ) {
			recordTracksEvent(
				'calypso_signup_design_global_styles_gating_modal_checkout_button_click',
				getEventPropsByDesign( selectedDesign, selectedStyleVariation )
			);

			const params = new URLSearchParams();

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
			params.append( 'redirect_to', destString );

			// The theme upsell link does not work with siteId and requires a siteSlug.
			// See https://github.com/Automattic/wp-calypso/pull/64899
			window.location.href = `/checkout/${ encodeURIComponent(
				siteSlug || urlToSlug( site?.URL || '' ) || ''
			) }/premium?${ params.toString() }`;
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

	const { setDesignOnSite } = useDispatch( SITE_STORE );
	const { setPendingAction } = useDispatch( ONBOARD_STORE );

	function pickDesign( _selectedDesign: Design | undefined = selectedDesign ) {
		setSelectedDesign( _selectedDesign );
		if ( siteSlugOrId && _selectedDesign ) {
			let positionIndex = generatedDesigns.findIndex(
				( design ) => design.slug === _selectedDesign.slug
			);
			if ( positionIndex === -1 ) {
				positionIndex = staticDesigns.findIndex(
					( design ) => design.slug === _selectedDesign.slug
				);
			}
			setPendingAction( () =>
				setDesignOnSite( siteSlugOrId, _selectedDesign, {
					styleVariation: selectedStyleVariation,
					verticalId: siteVerticalId,
				} ).then( () => reduxDispatch( requestActiveTheme( site?.ID || -1 ) ) )
			);

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

	function getPrimaryActionButton( pickDesignText: ReactChild ) {
		if ( shouldUpgrade ) {
			return (
				<Button primary borderless={ false } onClick={ upgradePlan }>
					{ translate( 'Unlock theme' ) }
				</Button>
			);
		}

		if (
			shouldLimitGlobalStyles &&
			selectedStyleVariation &&
			selectedStyleVariation.slug !== DEFAULT_VARIATION_SLUG
		) {
			return (
				<Button primary borderless={ false } onClick={ () => unlockPremiumGlobalStyles() }>
					{ translate( 'Unlock this style' ) }
				</Button>
			);
		}

		return (
			<Button primary borderless={ false } onClick={ () => pickDesign() }>
				{ pickDesignText }
			</Button>
		);
	}

	// ********** Main render logic

	// Don't render until we've done fetching all the data needed for initial render.
	if ( ! site || isLoadingSiteVertical || isLoadingDesigns ) {
		return null;
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
			vertical_id: selectedDesign.verticalizable ? siteVerticalId : undefined,
		} );

		const pickDesignText =
			selectedDesign.design_type === 'vertical' || selectedDesignHasStyleVariations
				? translate( 'Continue' )
				: translate( 'Start with %(designTitle)s', { args: { designTitle } } );

		const actionButtons = (
			<>
				{ selectedDesignHasStyleVariations && (
					<div className="action-buttons__title">{ headerDesignTitle }</div>
				) }
				<div>{ getPrimaryActionButton( pickDesignText ) }</div>
			</>
		);

		const stepContent = (
			<>
				<UpgradeModal
					slug={ selectedDesign.slug }
					isOpen={ showUpgradeModal }
					closeModal={ closeUpgradeModal }
					checkout={ goToCheckout }
				/>
				<PremiumGlobalStylesUpgradeModal
					checkout={ goToCheckoutForPremiumGlobalStyles }
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
				className="design-setup__preview"
				nextLabelText={ pickDesignText }
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

	const stepContent = (
		<UnifiedDesignPicker
			generatedDesigns={ generatedDesigns }
			staticDesigns={ staticDesigns }
			verticalId={ siteVerticalId }
			locale={ locale }
			onSelect={ pickDesign }
			onSelectBlankCanvas={ pickBlankCanvasDesign }
			onPreview={ previewDesign }
			onViewAllDesigns={ trackAllDesignsView }
			onCheckout={ goToCheckout }
			heading={ heading }
			categorization={ categorization }
			isPremiumThemeAvailable={ isPremiumThemeAvailable }
			purchasedThemes={ purchasedThemes }
			currentPlanFeatures={ currentPlanFeatures }
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
