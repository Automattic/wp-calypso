import { isEnabled } from '@automattic/calypso-config';
import { WPCOM_FEATURES_PREMIUM_THEMES } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { useStarterDesignsGeneratedQuery } from '@automattic/data-stores';
import DesignPicker, {
	GeneratedDesignPicker,
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
import GeneratedDesignPickerWebPreview from './generated-design-picker-web-preview';
import PreviewToolbar from './preview-toolbar';
import StickyPositioner from './sticky-positioner';
import UpgradeModal from './upgrade-modal';
import type { Step, ProvidedDependencies } from '../../types';
import './style.scss';
import type { Design } from '@automattic/design-picker';

// The distance from top when sticky should be 109px and it's aligned with thumbnails and previews
const STICKY_OPTIONS = {
	rootMargin: '-109px 0px 0px',
};

/**
 * The site setup design picker
 */
const UnifiedDesignPicker: Step = ( { navigation, flow } ) => {
	const [ isPreviewingDesign, setIsPreviewingDesign ] = useState( false );
	const [ isForceStaticDesigns, setIsForceStaticDesigns ] = useState( false );
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

	const showDesignPickerCategories = isEnabled( 'signup/design-picker-categories' );

	const showDesignPickerCategoriesAllFilter = isEnabled( 'signup/design-picker-categories' );

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

	const verticalsStepEnabled = isEnabled( 'signup/site-vertical-step' ) && isEnabledFTM;

	const enabledGeneratedDesigns =
		verticalsStepEnabled &&
		isEnabled( 'signup/design-picker-generated-designs' ) &&
		( intent === 'build' || intent === 'write' );

	const { data: generatedDesigns = [], isLoading: isLoadingGeneratedDesigns } =
		useStarterDesignsGeneratedQuery(
			{
				vertical_id: siteVerticalId,
				seed: siteSlugOrId || undefined,
				_locale: locale,
			},
			{ enabled: enabledGeneratedDesigns && !! siteVerticalId }
		);

	const showGeneratedDesigns =
		enabledGeneratedDesigns && generatedDesigns.length > 0 && ! isForceStaticDesigns;

	const selectedGeneratedDesign = useMemo( () => {
		const defaultDesign = ! isMobile ? generatedDesigns[ 0 ] : undefined;

		// Check if the selected design is a generated design, if not then select the default design.
		if (
			selectedDesign &&
			! generatedDesigns.find( ( _design ) => _design.slug === selectedDesign.slug )
		) {
			return defaultDesign;
		}

		return selectedDesign ?? defaultDesign;
	}, [ selectedDesign, generatedDesigns, isMobile ] );

	const isPreviewingGeneratedDesign =
		isMobile && showGeneratedDesigns && selectedDesign && isPreviewingDesign;

	const [ isSticky, setIsSticky ] = useState( false );

	const hasTrackedView = useRef( false );
	useEffect( () => {
		if ( showGeneratedDesigns && ! hasTrackedView.current ) {
			hasTrackedView.current = true;
			recordTracksEvent( 'calypso_signup_generated_design_picker_view', {
				vertical_id: siteVerticalId,
				generated_designs: generatedDesigns?.map( ( design ) => design.slug ).join( ',' ),
			} );
		}
	}, [ showGeneratedDesigns, hasTrackedView, generatedDesigns ] );

	function headerText() {
		if ( showGeneratedDesigns ) {
			return translate( 'Pick a design' );
		}

		if ( showDesignPickerCategories ) {
			return translate( 'Themes' );
		}

		return translate( 'Choose a design' );
	}

	function subHeaderText() {
		if ( showGeneratedDesigns ) {
			return translate(
				'Based on your input, these designs have been tailored for you. You can always change later.'
			);
		}

		if ( ! showDesignPickerCategories ) {
			return translate(
				'Pick your favorite homepage layout. You can customize or change it later.'
			);
		}

		const text = translate( 'Choose a starting theme. You can change it later.' );

		if ( isEnglishLocale ) {
			// An English only trick so the line wraps between sentences.
			return ( text as string )
				.replace( /\s/g, '\xa0' ) // Replace all spaces with non-breaking spaces
				.replace( /\.\s/g, '. ' ); // Replace all spaces at the end of sentences with a regular breaking space
		}

		return text;
	}

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

	const categorizationOptions = getCategorizationOptions(
		intent,
		showDesignPickerCategoriesAllFilter
	);
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

	function viewMoreDesigns() {
		recordTracksEvent( 'calypso_signup_design_view_more_select' );

		setSelectedDesign( undefined );
		setIsPreviewingDesign( false );
		setIsForceStaticDesigns( true );
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

		if ( ! isPreviewingDesign && isForceStaticDesigns ) {
			recordTracksEvent( 'calypso_signup_back_to_generated_design_step' );
		}

		recordTracksEvent( eventName, tracksProps );
	}

	const handleBackClick = () => {
		if ( isPreviewingDesign && ( ! showGeneratedDesigns || isMobile ) ) {
			setSelectedDesign( undefined );
			setIsPreviewingDesign( false );
			return;
		}

		if ( isForceStaticDesigns ) {
			setIsForceStaticDesigns( false );
			return;
		}

		goBack();
	};

	const handleShouldStickyChange = ( shouldSticky: boolean ) => {
		setIsSticky( shouldSticky );
	};

	// Track scroll event to make sure people are scrolling on mobile.
	useTrackScrollPageFromTop( isMobile && ! isPreviewingDesign, flow || '', STEP_NAME, {
		is_generated_designs: showGeneratedDesigns,
	} );

	// Make sure people is at the top when:
	// 1. Switching between generated designs and static designs.
	// 2. Entering/leaving preview mode.
	useEffect( () => {
		window.scrollTo( { top: 0 } );
	}, [ isForceStaticDesigns, isPreviewingDesign ] );

	// When the intent is build or write, we can potentially show the generated design picker.
	// Don't render until we've fetched the generated designs from the backend.
	if ( ! site || isLoadingGeneratedDesigns ) {
		return null;
	}

	if ( selectedDesign && isPreviewingDesign && ! showGeneratedDesigns ) {
		const isBlankCanvas = isBlankCanvasDesign( selectedDesign );
		const designTitle = isBlankCanvas ? translate( 'Blank Canvas' ) : selectedDesign.title;
		const shouldUpgrade = selectedDesign.is_premium && ! isPremiumThemeAvailable;
		const previewUrl = getDesignPreviewUrl( selectedDesign, {
			language: locale,
			// If the user fills out the site title with write intent, we show it on the design preview
			siteTitle: intent === 'write' ? siteTitle : undefined,
		} );

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

		const newDesignEnabled = isEnabled( 'signup/theme-preview-screen' );
		let actionButtons = (
			<>
				{ shouldUpgrade ? (
					<Button primary borderless={ false } onClick={ upgradePlan }>
						{ translate( 'Upgrade Plan' ) }
					</Button>
				) : undefined }
			</>
		);

		if ( newDesignEnabled ) {
			actionButtons = (
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
		}

		return (
			<>
				<StepContainer
					stepName={ STEP_NAME }
					stepContent={ stepContent }
					hideSkip
					hideNext={ newDesignEnabled || shouldUpgrade }
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

	const heading = (
		<FormattedHeader
			id={ 'step-header' }
			headerText={ headerText() }
			subHeaderText={ subHeaderText() }
			align="left"
		/>
	);

	const newDesignEnabled = isEnabled( 'signup/theme-preview-screen' );

	const stepContent = showGeneratedDesigns ? (
		<>
			<GeneratedDesignPicker
				selectedDesign={ selectedGeneratedDesign }
				designs={ generatedDesigns }
				verticalId={ siteVerticalId }
				locale={ locale }
				previews={ generatedDesigns.map( ( design ) => (
					<GeneratedDesignPickerWebPreview
						key={ design.slug }
						site={ site }
						design={ design }
						locale={ locale }
						verticalId={ siteVerticalId }
						isSelected={ design.slug === selectedGeneratedDesign?.slug }
						isStickyToolbar={ ! isMobile && isSticky }
						recordTracksEvent={ recordTracksEvent }
					/>
				) ) }
				heading={
					<>
						<div className={ classnames( 'step-container__header', 'design-setup__header' ) }>
							{ heading }
							<Button primary onClick={ () => pickDesign( selectedGeneratedDesign, 'top' ) }>
								{ translate( 'Continue' ) }
							</Button>
						</div>
						{ ! isMobile && (
							<StickyPositioner
								stickyOptions={ STICKY_OPTIONS }
								onShouldStickyChange={ handleShouldStickyChange }
							/>
						) }
					</>
				}
				footer={
					<div
						className={ classnames( 'step-container__footer', 'design-setup__footer', {
							'is-visible': isSticky,
						} ) }
					>
						<div className="design-setup__footer-content">
							<Button primary onClick={ () => pickDesign( selectedGeneratedDesign, 'bottom' ) }>
								{ translate( 'Continue' ) }
							</Button>
						</div>
					</div>
				}
				onPreview={ previewDesign }
				onViewMore={ viewMoreDesigns }
			/>
		</>
	) : (
		<DesignPicker
			designs={ shuffledStaticDesigns }
			theme={ 'light' }
			locale={ locale }
			onSelect={ pickDesign }
			onPreview={ previewDesign }
			onUpgrade={ upgradePlan }
			onCheckout={ goToCheckout }
			className={ classnames( {
				'design-setup__has-categories': showDesignPickerCategories,
			} ) }
			highResThumbnails
			premiumBadge={ <PremiumBadge isPremiumThemeAvailable={ isPremiumThemeAvailable } /> }
			categorization={ showDesignPickerCategories ? categorization : undefined }
			recommendedCategorySlug={ categorizationOptions.defaultSelection }
			categoriesHeading={ heading }
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
				'design-picker__has-categories': showDesignPickerCategories,
				'design-picker__sell-intent': ! newDesignEnabled && 'sell' === intent,
			} ) }
			shouldStickyNavButtons={ showGeneratedDesigns }
			hasStickyNavButtonsPadding={ isSticky }
			hideSkip={ isPreviewingGeneratedDesign }
			hideNext={ ! isPreviewingGeneratedDesign }
			skipButtonAlign={ 'top' }
			hideFormattedHeader
			backLabelText={
				isPreviewingGeneratedDesign ? translate( 'Pick another' ) : translate( 'Back' )
			}
			skipLabelText={ intent === 'write' ? translate( 'Skip and draft first post' ) : undefined }
			stepContent={ stepContent }
			recordTracksEvent={ recordStepContainerTracksEvent }
			goNext={ isPreviewingGeneratedDesign ? pickDesign : handleSubmit }
			goBack={ handleBackClick }
		/>
	);
};

export default UnifiedDesignPicker;
