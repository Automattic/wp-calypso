import { isEnabled } from '@automattic/calypso-config';
import { planHasFeature, FEATURE_PREMIUM_THEMES } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import DesignPicker, {
	FeaturedPicksButtons,
	PremiumBadge,
	useCategorization,
	isBlankCanvasDesign,
	getDesignPreviewUrl,
	useGeneratedDesigns,
	useThemeDesignsQuery,
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
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useFSEStatus } from '../../../../hooks/use-fse-status';
import { useSite } from '../../../../hooks/use-site';
import { useSiteSlugParam } from '../../../../hooks/use-site-slug-param';
import { ONBOARD_STORE, SITE_STORE } from '../../../../stores';
import { getCategorizationOptions, getGeneratedDesignsCategory } from './categories';
import PreviewToolbar from './preview-toolbar';
import type { Step } from '../../types';
import './style.scss';
import type { Design } from '@automattic/design-picker';
/**
 * The design picker step
 */
const designSetup: Step = function DesignSetup( { navigation } ) {
	const [ isPreviewingDesign, setIsPreviewingDesign ] = useState( false );
	// CSS breakpoints are set at 600px for mobile
	const isMobile = ! useViewportMatch( 'small' );
	const { goBack, submit } = navigation;
	const translate = useTranslate();
	const locale = useLocale();
	const site = useSite();
	const { setSelectedDesign, setPendingAction } = useDispatch( ONBOARD_STORE );
	const { setDesignOnSite } = useDispatch( SITE_STORE );

	const flowName = 'setup-site';
	const selectedDesign = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedDesign() );
	const intent = useSelect( ( select ) => select( ONBOARD_STORE ).getIntent() );
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
	const isPrivateAtomic = Boolean(
		site?.launch_status === 'unlaunched' && site?.options?.is_automated_transfer
	);

	const showDesignPickerCategories = isEnabled( 'signup/design-picker-categories' );
	const showDesignPickerCategoriesAllFilter = isEnabled( 'signup/design-picker-categories' );
	const showGeneratedDesigns =
		isEnabled( 'signup/design-picker-generated-designs' ) && intent === 'build' && !! siteVertical;

	// In order to show designs with a "featured" term in the theme_picks taxonomy at the below of categories filter
	const useFeaturedPicksButtons =
		showDesignPickerCategories && isEnabled( 'signup/design-picker-use-featured-picks-buttons' );
	const isPremiumThemeAvailable = Boolean(
		useMemo( () => sitePlanSlug && planHasFeature( sitePlanSlug, FEATURE_PREMIUM_THEMES ), [
			sitePlanSlug,
		] )
	);

	const tier =
		isPremiumThemeAvailable || isEnabled( 'signup/design-picker-premium-themes-checkout' )
			? 'all'
			: 'free';

	const { FSEEligible, isLoading } = useFSEStatus();
	const themeFilters = FSEEligible
		? 'auto-loading-homepage,full-site-editing'
		: 'auto-loading-homepage';

	const { data: themeDesigns = [] } = useThemeDesignsQuery(
		{ filter: themeFilters, tier },
		// Wait until block editor settings have loaded to load themes
		{ enabled: ! isLoading }
	);

	const staticDesigns = themeDesigns;

	const generatedDesignsCategory = useMemo(
		() => ( showGeneratedDesigns ? getGeneratedDesignsCategory( siteVertical.name ) : undefined ),
		[ showGeneratedDesigns, siteVertical ]
	);
	const generatedDesigns = useGeneratedDesigns( generatedDesignsCategory );

	const { designs, featuredPicksDesigns } = useMemo( () => {
		return {
			designs: [
				...generatedDesigns,
				...shuffle( staticDesigns.filter( ( design ) => ! design.is_featured_picks ) ),
			],
			featuredPicksDesigns: staticDesigns.filter(
				( design ) => design.is_featured_picks && ! isBlankCanvasDesign( design )
			),
		};
	}, [ staticDesigns, generatedDesigns ] );

	function headerText() {
		if ( showDesignPickerCategories ) {
			return translate( 'Themes' );
		}

		return translate( 'Choose a design' );
	}

	function subHeaderText() {
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
		flow: flowName,
		intent: intent,
	} );

	const categorizationOptions = getCategorizationOptions(
		intent,
		showDesignPickerCategoriesAllFilter,
		showGeneratedDesigns
	);
	const categorization = useCategorization( designs, categorizationOptions );

	function renderCategoriesFooter() {
		return (
			<>
				{ useFeaturedPicksButtons && (
					<FeaturedPicksButtons designs={ featuredPicksDesigns } onSelect={ pickDesign } />
				) }
			</>
		);
	}

	function pickDesign( _selectedDesign: Design | undefined = selectedDesign ) {
		setSelectedDesign( _selectedDesign );
		if ( siteSlug && _selectedDesign ) {
			setPendingAction( setDesignOnSite( siteSlug, _selectedDesign ) );
			const providedDependencies = {
				selectedDesign: _selectedDesign,
				selectedSiteCategory: categorization.selection,
			};
			submit?.( providedDependencies );
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
		if ( siteSlug ) {
			const params = new URLSearchParams();
			params.append( 'redirect_to', window.location.href.replace( window.location.origin, '' ) );

			window.location.href = `/checkout/${ encodeURIComponent(
				siteSlug
			) }/premium?${ params.toString() }`;
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

	stepContent = (
		<>
			<DesignPicker
				designs={ useFeaturedPicksButtons ? designs : [ ...featuredPicksDesigns, ...designs ] }
				theme={ isReskinned ? 'light' : 'dark' }
				locale={ locale }
				onSelect={ pickDesign }
				onPreview={ previewDesign }
				onUpgrade={ upgradePlan }
				className={ classnames( {
					'design-setup__has-categories': showDesignPickerCategories,
				} ) }
				highResThumbnails
				premiumBadge={ <PremiumBadge isPremiumThemeAvailable={ !! isPremiumThemeAvailable } /> }
				categorization={ showDesignPickerCategories ? categorization : undefined }
				recommendedCategorySlug={ categorizationOptions.defaultSelection }
				categoriesHeading={
					<FormattedHeader
						id={ 'step-header' }
						headerText={ headerText() }
						subHeaderText={ subHeaderText() }
						align="left"
					/>
				}
				categoriesFooter={ renderCategoriesFooter() }
				isPremiumThemeAvailable={ isPremiumThemeAvailable }
			/>
		</>
	);

	return (
		<StepContainer
			stepName={ 'design-step' }
			className={ classnames( {
				'design-picker__has-categories': showDesignPickerCategories,
			} ) }
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
