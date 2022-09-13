import { isEnabled } from '@automattic/calypso-config';
import { WPCOM_FEATURES_PREMIUM_THEMES } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { Onboard, useStarterDesignBySlug, useStarterDesignsQuery } from '@automattic/data-stores';
import {
	UnifiedDesignPicker,
	useCategorization,
	getDesignPreviewUrl,
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
import WebPreview from 'calypso/components/web-preview/content';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { urlToSlug } from 'calypso/lib/url';
import { requestActiveTheme } from 'calypso/state/themes/actions';
import { getPurchasedThemes } from 'calypso/state/themes/selectors/get-purchased-themes';
import { isThemePurchased } from 'calypso/state/themes/selectors/is-theme-purchased';
import { useSite } from '../../../../hooks/use-site';
import { useSiteIdParam } from '../../../../hooks/use-site-id-param';
import { useSiteSlugParam } from '../../../../hooks/use-site-slug-param';
import { ONBOARD_STORE, SITE_STORE } from '../../../../stores';
import { getCategorizationOptions } from './categories';
import { STEP_NAME } from './constants';
import DesignPickerDesignTitle from './design-picker-design-title';
import PreviewToolbar from './preview-toolbar';
import UpgradeModal from './upgrade-modal';
import getThemeIdFromDesign from './util/get-theme-id-from-design';
import type { Step, ProvidedDependencies } from '../../types';
import './style.scss';
import type { Design, StyleVariation } from '@automattic/design-picker';

const SiteIntent = Onboard.SiteIntent;

const UnifiedDesignPickerStep: Step = ( { navigation, flow } ) => {
	const { goBack, submit, exitFlow } = navigation;

	const reduxDispatch = useReduxDispatch();

	const translate = useTranslate();
	const locale = useLocale();

	// CSS breakpoints are set at 600px for mobile
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

	// ********** Logic for fetching designs

	const { data: allDesigns, isLoading: isLoadingDesigns } = useStarterDesignsQuery(
		{
			vertical_id: siteVerticalId,
			intent,
			seed: siteSlugOrId || undefined,
			_locale: locale,
		},
		{ enabled: true }
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
				has_vertical_images: generatedDesigns.length > 0,
			} );
		}
	}, [ hasTrackedView, generatedDesigns, staticDesigns ] );

	const categorizationOptions = getCategorizationOptions( intent, true );
	const categorization = useCategorization( staticDesigns, categorizationOptions );

	// ********** Logic for selecting a design

	const [ isPreviewingDesign, setIsPreviewingDesign ] = useState( false );

	// Make sure people is at the top when entering/leaving preview mode.
	useEffect( () => {
		window.scrollTo( { top: 0 } );
	}, [ isPreviewingDesign ] );

	const selectedDesign = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedDesign() );
	const { setSelectedDesign } = useDispatch( ONBOARD_STORE );

	function getEventPropsByDesign( design: Design ) {
		return {
			slug: design?.slug,
			theme: design?.recipe?.stylesheet,
			flow,
			intent,
			is_premium: design?.is_premium,
			design_type: design.design_type,
			...( design?.recipe?.pattern_ids && { pattern_ids: design.recipe.pattern_ids.join( ',' ) } ),
			...( design?.recipe?.header_pattern_ids && {
				header_pattern_ids: design.recipe.header_pattern_ids.join( ',' ),
			} ),
			...( design?.recipe?.footer_pattern_ids && {
				footer_pattern_ids: design.recipe.footer_pattern_ids.join( ',' ),
			} ),
		};
	}

	// ********** Logic for selecting a style variation of the selected design

	const isEnabledStyleSelection =
		selectedDesign &&
		selectedDesign.design_type !== 'vertical' &&
		selectedDesign.style_variations &&
		selectedDesign.style_variations.length > 0 &&
		isEnabled( 'signup/design-picker-style-selection' );

	const { data: selectedDesignDetails } = useStarterDesignBySlug( selectedDesign?.slug || '', {
		enabled: isPreviewingDesign && isEnabledStyleSelection,
	} );

	const selectedStyleVariation = useSelect( ( select ) =>
		select( ONBOARD_STORE ).getSelectedStyleVariation()
	);
	const { setSelectedStyleVariation } = useDispatch( ONBOARD_STORE );

	function previewDesign( _selectedDesign: Design, variation?: StyleVariation ) {
		recordTracksEvent(
			'calypso_signup_design_preview_select',
			getEventPropsByDesign( _selectedDesign )
		);

		setSelectedDesign( _selectedDesign );
		if ( variation ) {
			setSelectedStyleVariation( variation );
		}

		setIsPreviewingDesign( true );
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
	const shouldUpgrade =
		selectedDesign?.is_premium && ! isPremiumThemeAvailable && ! didPurchaseSelectedTheme;

	const [ showUpgradeModal, setShowUpgradeModal ] = useState( false );

	const isEligibleForProPlan = useSelect(
		( select ) => site && select( SITE_STORE ).isEligibleForProPlan( site.ID )
	);

	function upgradePlan() {
		if ( ! isEnabled( 'signup/seller-upgrade-modal' ) ) {
			return goToCheckout();
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
		if ( ! isEnabled( 'signup/design-picker-premium-themes-checkout' ) ) {
			return null;
		}

		if ( isEnabled( 'signup/seller-upgrade-modal' ) ) {
			recordTracksEvent( 'calypso_signup_design_upgrade_modal_checkout_button_click', {
				theme: selectedDesign?.slug,
			} );
		}

		const plan = isEligibleForProPlan && isEnabled( 'plans/pro-plan' ) ? 'pro' : 'premium';

		if ( siteSlugOrId ) {
			const params = new URLSearchParams();
			params.append( 'redirect_to', window.location.href.replace( window.location.origin, '' ) );

			// The theme upsell link does not work with siteId and requires a siteSlug.
			// See https://github.com/Automattic/wp-calypso/pull/64899
			window.location.href = `/checkout/${ encodeURIComponent(
				siteSlug || urlToSlug( site?.URL || '' ) || ''
			) }/${ plan }?${ params.toString() }`;
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
			recordTracksEvent( 'calypso_signup_select_design', {
				...getEventPropsByDesign( _selectedDesign ),
				...( positionIndex >= 0 && { position_index: positionIndex } ),
			} );

			if ( _selectedDesign.verticalizable ) {
				recordTracksEvent(
					'calypso_signup_select_verticalized_design',
					getEventPropsByDesign( _selectedDesign )
				);
			}

			handleSubmit( {
				selectedDesign: _selectedDesign,
				selectedSiteCategory: categorization.selection,
			} );
		}
	}

	function handleSubmit( providedDependencies?: ProvidedDependencies ) {
		const _selectedDesign = providedDependencies?.selectedDesign as Design;

		recordTracksEvent( 'calypso_signup_design_type_submit', {
			flow,
			intent,
			design_type: _selectedDesign?.design_type ?? 'default',
		} );

		submit?.( providedDependencies );
	}

	function handleBackClick() {
		if ( isPreviewingDesign ) {
			recordTracksEvent(
				'calypso_signup_design_preview_exit',
				getEventPropsByDesign( selectedDesign as Design )
			);

			setSelectedDesign( undefined );
			setSelectedStyleVariation( undefined );
			setIsPreviewingDesign( false );
			return;
		}

		goBack();
	}

	function recordStepContainerTracksEvent( eventName: string ) {
		const tracksProps = {
			step: 'design-step',
			intent: intent,
		};

		recordTracksEvent( eventName, tracksProps );
	}

	// ********** Main render logic

	// Don't render until we've fetched the designs from the backend.
	if ( ! site || isLoadingDesigns ) {
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
			selectedDesign?.design_type === 'vertical' || isEnabledStyleSelection
				? translate( 'Select and continue' )
				: translate( 'Start with %(designTitle)s', { args: { designTitle } } );

		const actionButtons = (
			<div>
				{ shouldUpgrade ? (
					<Button primary borderless={ false } onClick={ upgradePlan }>
						{ translate( 'Unlock theme' ) }
					</Button>
				) : (
					<Button primary borderless={ false } onClick={ () => pickDesign() }>
						{ pickDesignText }
					</Button>
				) }
			</div>
		);

		const stepContent = (
			<>
				<UpgradeModal
					slug={ selectedDesign.slug }
					isOpen={ showUpgradeModal }
					closeModal={ closeUpgradeModal }
					checkout={ goToCheckout }
				/>
				{ isEnabledStyleSelection ? (
					<AsyncLoad
						require="@automattic/design-preview"
						placeholder={ null }
						previewUrl={ previewUrl }
						title={ designTitle }
						description={ selectedDesign.description }
						variations={ selectedDesignDetails?.style_variations }
						selectedVariation={ selectedStyleVariation }
						onSelectVariation={ setSelectedStyleVariation }
						actionButtons={ actionButtons }
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

		return isEnabledStyleSelection ? (
			<StepContainer
				stepName={ STEP_NAME }
				stepContent={ stepContent }
				hideSkip
				className="design-setup__preview design-setup__preview__has-more-info"
				goBack={ handleBackClick }
				customizedActionButtons={ isMobile ? actionButtons : undefined }
				recordTracksEvent={ recordStepContainerTracksEvent }
			/>
		) : (
			<StepContainer
				stepName={ STEP_NAME }
				stepContent={ stepContent }
				hideSkip
				className={ 'design-setup__preview' }
				nextLabelText={ pickDesignText }
				goBack={ handleBackClick }
				goNext={ () => pickDesign() }
				formattedHeader={
					<FormattedHeader
						id={ 'design-setup-header' }
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
			id={ 'step-header' }
			headerText={ translate( 'Pick a design' ) }
			subHeaderText={ translate(
				'One of these homepage options could be great to start with. You can always change later.'
			) }
		/>
	);

	const newDesignEnabled = isEnabled( 'signup/theme-preview-screen' );

	const stepContent = (
		<UnifiedDesignPicker
			generatedDesigns={ generatedDesigns }
			staticDesigns={ staticDesigns }
			verticalId={ siteVerticalId }
			locale={ locale }
			onSelect={ pickDesign }
			onPreview={ previewDesign }
			onUpgrade={ upgradePlan }
			onCheckout={ goToCheckout }
			heading={ heading }
			categorization={ categorization }
			isPremiumThemeAvailable={ isPremiumThemeAvailable }
			previewOnly={ newDesignEnabled }
			hasDesignOptionHeader={ ! newDesignEnabled }
			purchasedThemes={ purchasedThemes }
		/>
	);

	return (
		<StepContainer
			stepName={ STEP_NAME }
			className="unified-design-picker__has-categories"
			skipButtonAlign={ 'top' }
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
