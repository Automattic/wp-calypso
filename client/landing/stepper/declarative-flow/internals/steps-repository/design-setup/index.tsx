import { isEnabled } from '@automattic/calypso-config';
import { WPCOM_FEATURES_PREMIUM_THEMES } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import { useVerticalImagesQuery } from '@automattic/data-stores';
import DesignPicker, {
	GeneratedDesignPicker,
	GeneratedDesignPreview,
	PremiumBadge,
	useCategorization,
	isBlankCanvasDesign,
	getDesignPreviewUrl,
	useGeneratedDesignsQuery,
	useDesignsBySite,
} from '@automattic/design-picker';
import { useLocale, englishLocales } from '@automattic/i18n-utils';
import { shuffle } from '@automattic/js-utils';
import { StepContainer } from '@automattic/onboarding';
import { useViewportMatch } from '@wordpress/compose';
import { useSelect, useDispatch } from '@wordpress/data';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useRef, useState } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import WebPreview from 'calypso/components/web-preview/content';
import { useNewSiteVisibility } from 'calypso/landing/gutenboarding/hooks/use-selected-plan';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSite } from '../../../../hooks/use-site';
import { useSiteSlugParam } from '../../../../hooks/use-site-slug-param';
import { ONBOARD_STORE, SITE_STORE, USER_STORE } from '../../../../stores';
import { ANCHOR_FM_THEMES } from './anchor-fm-themes';
import { getCategorizationOptions } from './categories';
import PreviewToolbar from './preview-toolbar';
import StickyFooter from './sticky-footer';
import type { Step } from '../../types';
import './style.scss';
import type { Design } from '@automattic/design-picker';

/**
 * The design picker step
 */
const designSetup: Step = function DesignSetup( { navigation, flow } ) {
	const continueButtonRef = useRef( null );
	const [ isPreviewingDesign, setIsPreviewingDesign ] = useState( false );
	const [ isForceStaticDesigns, setIsForceStaticDesigns ] = useState( false );
	// CSS breakpoints are set at 600px for mobile
	const isMobile = ! useViewportMatch( 'small' );
	const { goBack, submit } = navigation;
	const translate = useTranslate();
	const locale = useLocale();
	const site = useSite();
	const { setSelectedDesign, setPendingAction, createSite } = useDispatch( ONBOARD_STORE );
	const { setDesignOnSite } = useDispatch( SITE_STORE );
	const isAnchorSite = 'anchor-fm' === flow;
	const selectedDesign = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedDesign() );
	const intent = useSelect( ( select ) => select( ONBOARD_STORE ).getIntent() );
	const { anchorPodcastId, anchorEpisodeId, anchorSpotifyUrl } = useSelect( ( select ) =>
		select( ONBOARD_STORE ).getState()
	);
	const siteSlug = useSiteSlugParam();
	const siteTitle = site?.name;
	const isReskinned = true;
	const siteVerticalId = useSelect(
		( select ) => ( site && select( SITE_STORE ).getSiteVerticalId( site.ID ) ) || undefined
	);
	const { data: siteVerticalImages = [], isLoading: isLoadingSiteVerticalImages } =
		useVerticalImagesQuery( siteVerticalId || '', { limit: 1 } );
	const isVerticalizedWithImages = !! siteVerticalId && siteVerticalImages.length > 0;
	const isAtomic = useSelect( ( select ) => site && select( SITE_STORE ).isSiteAtomic( site.ID ) );
	const isPrivateAtomic = Boolean( site?.launch_status === 'unlaunched' && isAtomic );

	const isEligibleForProPlan = useSelect(
		( select ) => site && select( SITE_STORE ).isEligibleForProPlan( site.ID )
	);
	const showDesignPickerCategories =
		isEnabled( 'signup/design-picker-categories' ) && ! isAnchorSite;
	const showGeneratedDesigns =
		isEnabled( 'signup/design-picker-generated-designs' ) &&
		intent === 'build' &&
		isVerticalizedWithImages &&
		! isForceStaticDesigns;
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

	const { data: generatedDesigns = [], isLoading: isLoadingGeneratedDesigns } =
		useGeneratedDesignsQuery();
	const shuffledGeneratedDesigns = useMemo(
		() => shuffle( generatedDesigns ),
		[ generatedDesigns ]
	);

	const selectedGeneratedDesign = ! isMobile
		? selectedDesign || shuffledGeneratedDesigns[ 0 ]
		: undefined;
	const visibility = useNewSiteVisibility();

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
		if ( isAnchorSite ) {
			return translate(
				'Pick a homepage layout for your podcast site. You can customize or change it later.'
			);
		}

		if ( showGeneratedDesigns ) {
			return translate(
				'One of these homepage options could be great to start with. You can always change later.'
			);
		}

		if ( ! showDesignPickerCategories ) {
			return translate(
				'Pick your favorite homepage layout. You can customize or change it later.'
			);
		}

		const text = translate( 'Choose a starting theme. You can change it later.' );

		if ( englishLocales.includes( locale ) ) {
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
		...( design?.recipe?.patternIds && { pattern_ids: design.recipe.patternIds.join( ',' ) } ),
	} );

	const categorizationOptions = getCategorizationOptions(
		intent,
		showDesignPickerCategoriesAllFilter
	);
	const categorization = useCategorization( staticDesigns, categorizationOptions );
	const currentUser = useSelect( ( select ) => select( USER_STORE ).getCurrentUser() );
	const { getNewSite } = useSelect( ( select ) => select( SITE_STORE ) );

	function pickDesign(
		_selectedDesign: Design | undefined = selectedDesign,
		buttonLocation?: string
	) {
		setSelectedDesign( _selectedDesign );
		if ( siteSlug && _selectedDesign ) {
			const positionIndex = showGeneratedDesigns
				? shuffledGeneratedDesigns.findIndex( ( design ) => design.slug === _selectedDesign.slug )
				: -1;

			setPendingAction( () => setDesignOnSite( siteSlug, _selectedDesign, siteVerticalId ) );
			recordTracksEvent( 'calypso_signup_select_design', {
				...getEventPropsByDesign( _selectedDesign ),
				...( buttonLocation && { button_location: buttonLocation } ),
				...( showGeneratedDesigns && positionIndex >= 0 && { position_index: positionIndex } ),
			} );

			const providedDependencies = {
				selectedDesign: _selectedDesign,
				selectedSiteCategory: categorization.selection,
			};
			submit?.( providedDependencies );
		} else if ( isAnchorSite && _selectedDesign ) {
			setPendingAction( async () => {
				if ( ! currentUser ) {
					return;
				}

				await createSite( {
					username: currentUser.username,
					languageSlug: locale,
					bearerToken: undefined,
					visibility,
					anchorFmPodcastId: anchorPodcastId,
					anchorFmEpisodeId: anchorEpisodeId,
					anchorFmSpotifyUrl: anchorSpotifyUrl,
				} );

				const newSite = getNewSite();

				if ( ! newSite || ! newSite.site_slug ) {
					return;
				}

				return setDesignOnSite( newSite.site_slug, _selectedDesign, siteVerticalId );
			} );
			submit?.();
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
		goToCheckout();
	}

	function goToCheckout() {
		if ( ! isEnabled( 'signup/design-picker-premium-themes-checkout' ) ) {
			return null;
		}

		const plan = isEligibleForProPlan && isEnabled( 'plans/pro-plan' ) ? 'pro' : 'premium';

		if ( siteSlug ) {
			const params = new URLSearchParams();
			params.append( 'redirect_to', window.location.href.replace( window.location.origin, '' ) );

			window.location.href = `/checkout/${ encodeURIComponent(
				siteSlug
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

	function previewStaticDesign( design: Design ) {
		const isBlankCanvas = isBlankCanvasDesign( design );
		const designTitle = isBlankCanvas ? translate( 'Blank Canvas' ) : design.title;
		const shouldUpgrade = design.is_premium && ! isPremiumThemeAvailable;
		const previewUrl = getDesignPreviewUrl( design, {
			language: locale,
			// If the user fills out the site title with write intent, we show it on the design preview
			siteTitle: intent === 'write' ? siteTitle : undefined,
		} );

		const stepContent = (
			<WebPreview
				showPreview
				showClose={ false }
				showEdit={ false }
				externalUrl={ siteSlug }
				showExternal={ true }
				previewUrl={ previewUrl }
				loadingMessage={ translate( '{{strong}}One moment, please…{{/strong}} loading your site.', {
					components: { strong: <strong /> },
				} ) }
				toolbarComponent={ PreviewToolbar }
				siteId={ site?.ID }
				isPrivateAtomic={ isPrivateAtomic }
				url={ site?.URL }
				translate={ translate }
				recordTracksEvent={ recordTracksEvent }
			/>
		);

		return (
			<StepContainer
				stepName={ 'design-setup' }
				stepContent={ stepContent }
				hideSkip
				hideNext={ shouldUpgrade }
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
				customizedActionButtons={
					<>
						{ shouldUpgrade ? (
							<Button primary borderless={ false } onClick={ upgradePlan }>
								{ translate( 'Upgrade Plan' ) }
							</Button>
						) : undefined }
					</>
				}
				recordTracksEvent={ recordStepContainerTracksEvent }
			/>
		);
	}

	function previewGeneratedDesign( design: Design ) {
		const stepContent = (
			<GeneratedDesignPreview
				slug={ design.slug }
				previewUrl={ getDesignPreviewUrl( design, {
					language: locale,
					verticalId: siteVerticalId,
				} ) }
				isSelected
			/>
		);

		return (
			<StepContainer
				stepName={ 'design-setup' }
				stepContent={ stepContent }
				hideSkip
				hideNext={ false }
				className={ classnames( 'design-setup__preview', 'design-picker__is-generated' ) }
				nextLabelText={ 'Continue' }
				backLabelText={ 'Pick another' }
				goBack={ handleBackClick }
				goNext={ () => pickDesign() }
				recordTracksEvent={ recordStepContainerTracksEvent }
			/>
		);
	}

	if ( selectedDesign && isPreviewingDesign ) {
		if ( showGeneratedDesigns && isMobile ) {
			return previewGeneratedDesign( selectedDesign );
		}

		if ( ! showGeneratedDesigns ) {
			return previewStaticDesign( selectedDesign );
		}
	}

	// When the intent is build, we can potentially show the generated design picker.
	// Additional data is needed from the backend to determine whether to show it or not.
	if (
		intent === 'build' &&
		( isLoadingSiteVerticalImages || ( showGeneratedDesigns && isLoadingGeneratedDesigns ) )
	) {
		return null;
	}

	const heading = (
		<FormattedHeader
			className={ isAnchorSite ? 'is-anchor-header' : null }
			id={ 'step-header' }
			headerText={ headerText() }
			subHeaderText={ subHeaderText() }
			align="left"
		/>
	);

	const stepContent = showGeneratedDesigns ? (
		<GeneratedDesignPicker
			selectedDesign={ selectedGeneratedDesign }
			designs={ shuffledGeneratedDesigns }
			verticalId={ siteVerticalId }
			locale={ locale }
			heading={
				<div className={ classnames( 'step-container__header', 'design-setup__header' ) }>
					{ heading }
					<Button
						ref={ continueButtonRef }
						primary
						onClick={ () => pickDesign( selectedGeneratedDesign, 'top' ) }
					>
						{ translate( 'Continue' ) }
					</Button>
				</div>
			}
			footer={
				<StickyFooter
					className={ classnames( 'step-container__footer', 'design-setup__footer' ) }
					targetRef={ continueButtonRef }
				>
					<div className={ 'design-setup__footer-inner' }>
						<Button primary onClick={ () => pickDesign( selectedGeneratedDesign, 'bottom' ) }>
							{ translate( 'Continue' ) }
						</Button>
					</div>
				</StickyFooter>
			}
			onPreview={ previewDesign }
			onViewMore={ viewMoreDesigns }
		/>
	) : (
		<DesignPicker
			designs={ isAnchorSite ? ( ANCHOR_FM_THEMES as Design[] ) : shuffledStaticDesigns }
			theme={ isReskinned ? 'light' : 'dark' }
			locale={ locale }
			onSelect={ pickDesign }
			onPreview={ previewDesign }
			onUpgrade={ upgradePlan }
			className={ classnames( {
				'design-setup__has-categories': showDesignPickerCategories,
			} ) }
			isGridMinimal={ isAnchorSite }
			highResThumbnails
			hideFullScreenPreview={ isAnchorSite }
			premiumBadge={ <PremiumBadge isPremiumThemeAvailable={ isPremiumThemeAvailable } /> }
			categorization={ showDesignPickerCategories ? categorization : undefined }
			recommendedCategorySlug={ categorizationOptions.defaultSelection }
			categoriesHeading={ heading }
			anchorHeading={ isAnchorSite && heading }
			isPremiumThemeAvailable={ isPremiumThemeAvailable }
		/>
	);

	return (
		<StepContainer
			stepName={ 'design-step' }
			className={ classnames( {
				'design-picker__is-generated': showGeneratedDesigns,
				'design-picker__has-categories': showDesignPickerCategories,
				'design-picker__sell-intent': 'sell' === intent,
			} ) }
			hideSkip={ isAnchorSite }
			skipButtonAlign={ 'top' }
			hideFormattedHeader
			skipLabelText={ intent === 'write' ? translate( 'Skip and draft first post' ) : undefined }
			stepContent={ stepContent }
			recordTracksEvent={ recordStepContainerTracksEvent }
			goNext={ () => submit?.() }
			goBack={ handleBackClick }
		/>
	);
};

export default designSetup;
