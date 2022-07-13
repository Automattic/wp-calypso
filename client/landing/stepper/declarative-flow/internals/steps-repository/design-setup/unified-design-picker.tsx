import { isEnabled } from '@automattic/calypso-config';
import { WPCOM_FEATURES_PREMIUM_THEMES } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { useStarterDesignsGeneratedQuery } from '@automattic/data-stores';
import {
	UnifiedDesignPicker,
	PremiumBadge,
	useCategorization,
	isBlankCanvasDesign,
	getDesignPreviewUrl,
	useDesignsBySite,
} from '@automattic/design-picker';
import { useLocale, useIsEnglishLocale } from '@automattic/i18n-utils';
import { shuffle } from '@automattic/js-utils';
import { StepContainer } from '@automattic/onboarding';
import { useViewportMatch } from '@wordpress/compose';
import { useSelect, useDispatch } from '@wordpress/data';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useRef, useState, useEffect } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import WebPreview from 'calypso/components/web-preview/content';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { urlToSlug } from 'calypso/lib/url';
import { useSite } from '../../../../hooks/use-site';
import { useSiteIdParam } from '../../../../hooks/use-site-id-param';
import { useSiteSlugParam } from '../../../../hooks/use-site-slug-param';
import useTrackScrollPageFromTop from '../../../../hooks/use-track-scroll-page-from-top';
import { ONBOARD_STORE, SITE_STORE } from '../../../../stores';
import { getCategorizationOptions } from './categories';
import { STEP_NAME } from './constants';
import PreviewToolbar from './preview-toolbar';
import UpgradeModal from './upgrade-modal';
import type { Step, ProvidedDependencies } from '../../types';
import './style.scss';
import type { Design } from '@automattic/design-picker';

/**
 * The site setup design picker
 */
const UnifiedDesignPickerStep: Step = ( { navigation, flow } ) => {
	const [ isPreviewingDesign, setIsPreviewingDesign ] = useState( false );
	const [ showUpgradeModal, setShowUpgradeModal ] = useState( false );
	// CSS breakpoints are set at 600px for mobile
	const isMobile = ! useViewportMatch( 'small' );
	const { goBack, submit, exitFlow } = navigation;
	const translate = useTranslate();
	const locale = useLocale();
	const isEnglishLocale = useIsEnglishLocale();
	const isEnabledFTM = isEnabled( 'signup/ftm-flow-non-en' ) || isEnglishLocale;
	const site = useSite();
	const { setSelectedDesign, setPendingAction } = useDispatch( ONBOARD_STORE );
	const { setDesignOnSite } = useDispatch( SITE_STORE );
	const selectedDesign = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedDesign() );
	const intent = useSelect( ( select ) => select( ONBOARD_STORE ).getIntent() );
	const siteSlug = useSiteSlugParam();
	const siteId = useSiteIdParam();
	const siteSlugOrId = siteSlug ? siteSlug : siteId;
	const siteTitle = site?.name;
	const isAtomic = useSelect( ( select ) => site && select( SITE_STORE ).isSiteAtomic( site.ID ) );
	useEffect( () => {
		if ( isAtomic ) {
			exitFlow?.( `/site-editor/${ siteSlugOrId }` );
		}
	}, [ isAtomic ] );
	const isEligibleForProPlan = useSelect(
		( select ) => site && select( SITE_STORE ).isEligibleForProPlan( site.ID )
	);

	const siteVerticalId = useSelect(
		( select ) => ( site && select( SITE_STORE ).getSiteVerticalId( site.ID ) ) || ''
	);

	const isPremiumThemeAvailable = Boolean(
		useSelect(
			( select ) =>
				site && select( SITE_STORE ).siteHasFeature( site.ID, WPCOM_FEATURES_PREMIUM_THEMES )
		)
	);

	const { data: themeDesigns = [] } = useDesignsBySite( site );

	const staticDesigns = themeDesigns;
	const shuffledStaticDesigns = useMemo(
		() => shuffle( staticDesigns.filter( ( design ) => ! isBlankCanvasDesign( design ) ) ),
		[ staticDesigns ]
	);

	const enabledGeneratedDesigns = isEnabledFTM && ( intent === 'build' || intent === 'write' );

	const { data: generatedDesigns = [], isLoading: isLoadingGeneratedDesigns } =
		useStarterDesignsGeneratedQuery(
			{
				vertical_id: siteVerticalId,
				seed: siteSlugOrId || undefined,
				_locale: locale,
			},
			{ enabled: enabledGeneratedDesigns && !! siteVerticalId }
		);

	const showGeneratedDesigns = enabledGeneratedDesigns && generatedDesigns.length > 0;

	const isPreviewingGeneratedDesign =
		isMobile && showGeneratedDesigns && selectedDesign && isPreviewingDesign;

	const hasTrackedView = useRef( false );
	useEffect( () => {
		if ( hasTrackedView.current ) {
			hasTrackedView.current = true;
			recordTracksEvent( 'calypso_signup_unified_design_picker_view', {
				vertical_id: siteVerticalId,
				generated_designs: generatedDesigns?.map( ( design ) => design.slug ).join( ',' ),
				// todo: add static designs
			} );
		}
	}, [ hasTrackedView, generatedDesigns ] );

	const getEventPropsByDesign = ( design: Design ) => ( {
		slug: design?.slug,
		theme: design?.recipe?.stylesheet,
		template: design?.template,
		flow,
		intent,
		is_premium: design?.is_premium,
		is_generated: showGeneratedDesigns,
		...( design?.recipe?.pattern_ids && { pattern_ids: design.recipe.pattern_ids.join( ',' ) } ),
	} );

	const categorizationOptions = getCategorizationOptions( intent, true );
	const categorization = useCategorization( staticDesigns, categorizationOptions );

	const handleSubmit = ( providedDependencies?: ProvidedDependencies ) => {
		const _selectedDesign = providedDependencies?.selectedDesign as Design;

		recordTracksEvent( 'calypso_signup_design_type_submit', {
			flow,
			intent,
			design_type: _selectedDesign?.design_type ?? 'default',
		} );

		submit?.( providedDependencies );
	};

	const closeUpgradeModal = () => {
		recordTracksEvent( 'calypso_signup_design_upgrade_modal_close_button_click', {
			theme: selectedDesign?.slug,
		} );
		setShowUpgradeModal( false );
	};

	function pickDesign(
		_selectedDesign: Design | undefined = selectedDesign,
		buttonLocation?: string
	) {
		setSelectedDesign( _selectedDesign );
		if ( siteSlugOrId && _selectedDesign ) {
			const positionIndex = showGeneratedDesigns
				? generatedDesigns.findIndex( ( design ) => design.slug === _selectedDesign.slug )
				: -1;

			setPendingAction( () => setDesignOnSite( siteSlugOrId, _selectedDesign, siteVerticalId ) );
			recordTracksEvent( 'calypso_signup_select_design', {
				...getEventPropsByDesign( _selectedDesign ),
				...( buttonLocation && { button_location: buttonLocation } ),
				...( showGeneratedDesigns && positionIndex >= 0 && { position_index: positionIndex } ),
			} );

			handleSubmit( {
				selectedDesign: _selectedDesign,
				selectedSiteCategory: categorization.selection,
			} );
		}
	}

	function previewDesign( _selectedDesign: Design, positionIndex?: number ) {
		recordTracksEvent( 'calypso_signup_design_preview_select', {
			...getEventPropsByDesign( _selectedDesign ),
			...( positionIndex && { position_index: positionIndex } ),
		} );

		setSelectedDesign( _selectedDesign );
		setIsPreviewingDesign( true );
	}

	function upgradePlan() {
		if ( ! isEnabled( 'signup/seller-upgrade-modal' ) ) {
			return goToCheckout();
		}

		recordTracksEvent( 'calypso_signup_design_upgrade_modal_show', {
			theme: selectedDesign?.slug,
		} );
		setShowUpgradeModal( true );
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

	function recordStepContainerTracksEvent( eventName: string ) {
		const tracksProps = {
			step: showGeneratedDesigns ? 'generated-design-step' : 'design-step',
			intent: intent,
		};

		recordTracksEvent( eventName, tracksProps );
	}

	const handleBackClick = () => {
		if ( isPreviewingDesign && ( ! showGeneratedDesigns || isMobile ) ) {
			setSelectedDesign( undefined );
			setIsPreviewingDesign( false );
			return;
		}

		goBack();
	};

	// Track scroll event to make sure people are scrolling on mobile.
	useTrackScrollPageFromTop( isMobile && ! isPreviewingDesign, flow || '', STEP_NAME, {
		is_generated_designs: showGeneratedDesigns,
	} );

	// Make sure people is at the top when entering/leaving preview mode.
	useEffect( () => {
		window.scrollTo( { top: 0 } );
	}, [ isPreviewingDesign ] );

	// When the intent is build or write, we can potentially show the generated design picker.
	// Don't render until we've fetched the generated designs from the backend.
	if ( ! site || isLoadingGeneratedDesigns ) {
		return null;
	}

	if ( selectedDesign && isPreviewingDesign ) {
		const isBlankCanvas = isBlankCanvasDesign( selectedDesign );
		const designTitle = isBlankCanvas ? translate( 'Blank Canvas' ) : selectedDesign.title;
		const shouldUpgrade = selectedDesign.is_premium && ! isPremiumThemeAvailable;
		const previewUrl = getDesignPreviewUrl( selectedDesign, {
			language: locale,
			// If the user fills out the site title with write intent, we show it on the design preview
			siteTitle: intent === 'write' ? siteTitle : undefined,
		} );

		// todo: handle previewing and selecting generated designs

		const stepContent = (
			<>
				<UpgradeModal
					slug={ selectedDesign.slug }
					isOpen={ showUpgradeModal }
					closeModal={ closeUpgradeModal }
					checkout={ goToCheckout }
				/>
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
			</>
		);

		const actionButtons = (
			<div>
				{ shouldUpgrade ? (
					<Button primary borderless={ false } onClick={ upgradePlan }>
						{ translate( 'Unlock theme' ) }
					</Button>
				) : (
					<Button primary borderless={ false } onClick={ () => pickDesign() }>
						{ translate( 'Start with %(designTitle)s', { args: { designTitle } } ) }
					</Button>
				) }
			</div>
		);

		return (
			<>
				<StepContainer
					stepName={ STEP_NAME }
					stepContent={ stepContent }
					hideSkip
					hideNext={ true }
					className={ 'design-setup__preview' }
					nextLabelText={ translate( 'Start with %(designTitle)s', { args: { designTitle } } ) }
					goBack={ handleBackClick }
					goNext={ () => pickDesign() }
					formattedHeader={
						<FormattedHeader
							id={ 'design-setup-header' }
							headerText={ designTitle }
							align={ isMobile ? 'left' : 'center' }
						/>
					}
					customizedActionButtons={ actionButtons }
					recordTracksEvent={ recordStepContainerTracksEvent }
				/>
			</>
		);
	}

	const categoriesHeading = (
		<FormattedHeader
			id={ 'step-header' }
			headerText={ translate( 'Selected themes for you' ) }
			subHeaderText={ translate( "These might work if you'd like" ) }
			align="left"
		/>
	);

	const newDesignEnabled = isEnabled( 'signup/theme-preview-screen' );

	const stepContent = (
		<UnifiedDesignPicker
			generatedDesigns={ generatedDesigns }
			staticDesigns={ shuffledStaticDesigns }
			verticalId={ siteVerticalId }
			locale={ locale }
			onSelect={ pickDesign }
			onPreview={ previewDesign }
			onUpgrade={ upgradePlan }
			onCheckout={ goToCheckout }
			premiumBadge={ <PremiumBadge isPremiumThemeAvailable={ isPremiumThemeAvailable } /> }
			generatedDesignsHeading={ 'Suitable for your site type' }
			categorization={ categorization }
			categoriesHeading={ categoriesHeading }
			isPremiumThemeAvailable={ isPremiumThemeAvailable }
			previewOnly={ newDesignEnabled }
			hasDesignOptionHeader={ ! newDesignEnabled }
		/>
	);

	return (
		<StepContainer
			stepName={ STEP_NAME }
			className={ classnames( {
				'design-picker__is-generated': showGeneratedDesigns,
				'design-picker__is-generated-previewing': isPreviewingGeneratedDesign,
				'design-picker__has-categories': true,
			} ) }
			skipButtonAlign={ 'top' }
			hideFormattedHeader
			backLabelText={ translate( 'Back' ) }
			skipLabelText={
				intent === 'write' ? translate( 'Skip and draft first post' ) : translate( 'Skip for now' )
			}
			stepContent={ stepContent }
			recordTracksEvent={ recordStepContainerTracksEvent }
			goNext={ isPreviewingGeneratedDesign ? pickDesign : handleSubmit }
			goBack={ handleBackClick }
		/>
	);
};

export default UnifiedDesignPickerStep;
