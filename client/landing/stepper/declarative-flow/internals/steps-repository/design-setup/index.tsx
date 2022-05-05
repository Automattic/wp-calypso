import { isEnabled } from '@automattic/calypso-config';
import { planHasFeature, FEATURE_PREMIUM_THEMES } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import DesignPicker, {
	GeneratedDesignPicker,
	PremiumBadge,
	useCategorization,
	isBlankCanvasDesign,
	getDesignPreviewUrl,
	useGeneratedDesigns,
	useDesignsBySite,
} from '@automattic/design-picker';
import { useLocale, englishLocales } from '@automattic/i18n-utils';
import { shuffle } from '@automattic/js-utils';
import { StepContainer } from '@automattic/onboarding';
import { useViewportMatch } from '@wordpress/compose';
import { useSelect, useDispatch } from '@wordpress/data';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
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
import type { Step } from '../../types';
import './style.scss';
import type { Design } from '@automattic/design-picker';

/**
 * The design picker step
 */
const designSetup: Step = function DesignSetup( { navigation, flow } ) {
	const [ isPreviewingDesign, setIsPreviewingDesign ] = useState( false );
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
	const sitePlanSlug = site?.plan?.product_slug;
	const siteVertical = useMemo(
		() => ( {
			// TODO: fetch from store/site settings
			id: '439',
			name: 'Photographic & Digital Arts',
		} ),
		[]
	);

	const isAtomic = useSelect( ( select ) => site && select( SITE_STORE ).isSiteAtomic( site.ID ) );
	const isPrivateAtomic = Boolean( site?.launch_status === 'unlaunched' && isAtomic );

	const isEligibleForProPlan = useSelect(
		( select ) => site && select( SITE_STORE ).isEligibleForProPlan( site.ID )
	);
	const showDesignPickerCategories =
		isEnabled( 'signup/design-picker-categories' ) && ! isAnchorSite;
	const showGeneratedDesigns =
		isEnabled( 'signup/design-picker-generated-designs' ) && intent === 'build' && !! siteVertical;
	const showDesignPickerCategoriesAllFilter =
		isEnabled( 'signup/design-picker-categories' ) && ! showGeneratedDesigns;

	const isPremiumThemeAvailable = Boolean(
		useMemo(
			() => sitePlanSlug && planHasFeature( sitePlanSlug, FEATURE_PREMIUM_THEMES ),
			[ sitePlanSlug ]
		)
	);

	const { data: themeDesigns = [] } = useDesignsBySite( site );

	const staticDesigns = themeDesigns;
	const generatedDesigns = useGeneratedDesigns();

	const designs = useMemo(
		() =>
			showGeneratedDesigns
				? generatedDesigns
				: shuffle( staticDesigns.filter( ( design ) => ! isBlankCanvasDesign( design ) ) ),
		[ staticDesigns, generatedDesigns ]
	);

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
		theme: design.recipe?.stylesheet,
		template: design.template,
		is_premium: design?.is_premium,
		flow,
		intent: intent,
	} );

	const categorizationOptions = getCategorizationOptions(
		intent,
		showDesignPickerCategoriesAllFilter,
		showGeneratedDesigns
	);
	const categorization = useCategorization( designs, categorizationOptions );
	const currentUser = useSelect( ( select ) => select( USER_STORE ).getCurrentUser() );
	const { getNewSite } = useSelect( ( select ) => select( SITE_STORE ) );

	function pickDesign( _selectedDesign: Design | undefined = selectedDesign ) {
		setSelectedDesign( _selectedDesign );
		if ( siteSlug && _selectedDesign ) {
			setPendingAction( () => setDesignOnSite( siteSlug, _selectedDesign ) );
			recordTracksEvent( 'calypso_signup_select_design', getEventPropsByDesign( _selectedDesign ) );
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

				return setDesignOnSite( newSite.site_slug, _selectedDesign );
			} );
			submit?.();
		}
	}

	function previewDesign( _selectedDesign: Design ) {
		recordTracksEvent(
			'calypso_signup_design_preview_select',
			getEventPropsByDesign( _selectedDesign )
		);

		setSelectedDesign( _selectedDesign );
		setIsPreviewingDesign( true );
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

	const handleBackClick = () => {
		if ( selectedDesign ) {
			setSelectedDesign( undefined );
			setIsPreviewingDesign( false );
		} else {
			goBack();
		}
	};

	let stepContent = <div />;

	if ( selectedDesign && isPreviewingDesign ) {
		const isBlankCanvas = isBlankCanvasDesign( selectedDesign );
		const designTitle = isBlankCanvas ? translate( 'Blank Canvas' ) : selectedDesign.title;
		const shouldUpgrade = selectedDesign.is_premium && ! isPremiumThemeAvailable;
		const previewUrl = getDesignPreviewUrl( selectedDesign, {
			language: locale,
			// If the user fills out the site title with write intent, we show it on the design preview
			siteTitle: intent === 'write' ? siteTitle : undefined,
		} );

		stepContent = (
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
				recordTracksEvent={ recordTracksEvent }
			/>
		);
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

	stepContent = showGeneratedDesigns ? (
		<GeneratedDesignPicker
			designs={ designs }
			locale={ locale }
			heading={
				<div className={ classnames( 'step-container__header', 'design-setup__header' ) }>
					{ heading }
					<Button primary>{ translate( 'Continue' ) }</Button>
				</div>
			}
		/>
	) : (
		<DesignPicker
			designs={ isAnchorSite ? ( ANCHOR_FM_THEMES as Design[] ) : designs }
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
			premiumBadge={ <PremiumBadge isPremiumThemeAvailable={ !! isPremiumThemeAvailable } /> }
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
			recordTracksEvent={ recordTracksEvent }
			goNext={ () => submit?.() }
			goBack={ handleBackClick }
		/>
	);
};

export default designSetup;
