import { isEnabled } from '@automattic/calypso-config';
import { planHasFeature, FEATURE_PREMIUM_THEMES } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import DesignPicker, {
	FeaturedPicksButtons,
	PremiumBadge,
	useCategorization,
	isBlankCanvasDesign,
	getDesignUrl,
	useThemeDesignsQuery,
} from '@automattic/design-picker';
import { useLocale, englishLocales } from '@automattic/i18n-utils';
import { shuffle } from '@automattic/js-utils';
import { StepContainer } from '@automattic/onboarding';
import { Spinner } from '@wordpress/components';
import { useViewportMatch } from '@wordpress/compose';
import { useSelect, useDispatch } from '@wordpress/data';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
import FormattedHeader from 'calypso/components/formatted-header';
import WebPreview from 'calypso/components/web-preview/content';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import AsyncCheckoutModal from 'calypso/my-sites/checkout/modal/async';
import { useFSEStatus } from '../../../../hooks/use-fse-status';
import { useSite } from '../../../../hooks/use-site';
import { useSiteSlugParam } from '../../../../hooks/use-site-slug-param';
import { ONBOARD_STORE, SITE_STORE } from '../../../../stores';
import PreviewToolbar from './preview-toolbar';
import type { Step } from '../../types';
import './style.scss';
import type { Design, Category } from '@automattic/design-picker';
/**
 * The design picker step
 */
const designSetup: Step = function DesignSetup( { navigation } ) {
	const [ isPreviewingDesign, setIsPreviewingDesign ] = useState( false );
	const [ loading, setIsLoading ] = useState( false );
	// CSS breakpoints are set at 600px for mobile
	const isMobile = ! useViewportMatch( 'small' );
	const { goBack, submit } = navigation;
	const translate = useTranslate();
	const locale = useLocale();
	const site = useSite();
	const { setSelectedDesign } = useDispatch( ONBOARD_STORE );
	const { setDesignOnSite } = useDispatch( SITE_STORE );

	// // const signupDependencies = useSelector( ( state ) => getSignupDependencyStore( state ) );

	// // TODO EMN: These values should come from state
	const flowName = 'setup-site';
	const selectedDesign = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedDesign() );
	const intent = useSelect( ( select ) => select( ONBOARD_STORE ).getIntent() );
	const siteSlug = useSiteSlugParam();
	const siteTitle = site?.name;
	const isReskinned = true;
	const sitePlanSlug = site?.plan?.product_slug;

	const showDesignPickerCategories = isEnabled( 'signup/design-picker-categories' );
	const showDesignPickerCategoriesAllFilter = isEnabled( 'signup/design-picker-categories' );

	// // In order to show designs with a "featured" term in the theme_picks taxonomy at the below of categories filter
	const useFeaturedPicksButtons =
		showDesignPickerCategories && isEnabled( 'signup/design-picker-use-featured-picks-buttons' );
	const isPremiumThemeAvailable = useMemo(
		() => sitePlanSlug && planHasFeature( sitePlanSlug, FEATURE_PREMIUM_THEMES ),
		[ sitePlanSlug ]
	);

	const tier =
		isPremiumThemeAvailable || isEnabled( 'signup/design-picker-premium-themes-checkout' )
			? 'all'
			: 'free';

	const { FSEEligible, isLoading } = useFSEStatus();
	const themeFilters = FSEEligible
		? 'auto-loading-homepage,full-site-editing'
		: 'auto-loading-homepage';

	const { data: apiThemes = [] } = useThemeDesignsQuery(
		{ filter: themeFilters, tier },
		// Wait until block editor settings have loaded to load themes
		{ enabled: ! isLoading }
	);

	const allThemes = apiThemes;

	const { designs, featuredPicksDesigns } = useMemo( () => {
		return {
			designs: shuffle( allThemes.filter( ( theme ) => ! theme.is_featured_picks ) ),
			featuredPicksDesigns: allThemes.filter( ( theme ) => theme.is_featured_picks ),
		};
	}, [ allThemes ] );

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
		theme: design?.stylesheet ?? `pub/${ design.theme }`,
		template: design.template,
		is_premium: design?.is_premium,
		flow: flowName,
		intent: intent,
	} );

	const getCategorizationOptionsForStep = () => {
		const result: {
			showAllFilter: boolean;
			defaultSelection: string | null;
			sort: ( a: Category, b: Category ) => 0 | 1 | -1;
		} = {
			showAllFilter: showDesignPickerCategoriesAllFilter,
			defaultSelection: '',
			sort: sortBlogToTop,
		};
		switch ( intent ) {
			case 'write':
				result.defaultSelection = 'blog';
				result.sort = sortBlogToTop;
				break;
			case 'sell':
				result.defaultSelection = 'store';
				result.sort = sortStoreToTop;
				break;
			default:
				result.defaultSelection = null;
				result.sort = sortBlogToTop;
				break;
		}

		return result;
	};
	const categorization = useCategorization( designs, getCategorizationOptionsForStep() );

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
		setIsLoading( true );
		setSelectedDesign( _selectedDesign );
		if ( siteSlug && _selectedDesign ) {
			setDesignOnSite( siteSlug, _selectedDesign ).then( () => {
				const providedDependencies = {
					selectedDesign: _selectedDesign,
					selectedSiteCategory: categorization.selection,
				};
				submit?.( providedDependencies );
			} );
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
		// disable for now
		/*
		const params = new URLSearchParams( window.location.search );
		params.append( 'products', PLAN_PREMIUM );
		history.replace( { search: params.toString() } );
		*/
	}

	function renderCheckoutModal() {
		if ( ! isEnabled( 'signup/design-picker-premium-themes-checkout' ) ) {
			return null;
		}

		return <AsyncCheckoutModal />;
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
		const previewUrl = getDesignUrl( selectedDesign, locale, {
			iframe: true,
			// If the user fills out the site title with write intent, we show it on the design preview
			// Otherwise, use the title of selected design directly
			site_title: intent === 'write' && siteTitle ? siteTitle : selectedDesign?.title,
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
				// TODO: figure out how to get this info
				isPrivateAtomic={ false }
				url={ site?.URL }
				shouldConnectContent={ false }
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
				shouldHideNavButtons={ loading }
				customizedActionButtons={
					<>
						{ shouldUpgrade ? (
							<Button primary borderless={ false } onClick={ upgradePlan }>
								{ translate( 'Upgrade Plan' ) }
							</Button>
						) : undefined }
						{ loading ? <Spinner /> : '' }
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
				recommendedCategorySlug={ getCategorizationOptionsForStep().defaultSelection }
				categoriesHeading={
					<FormattedHeader
						id={ 'step-header' }
						headerText={ headerText() }
						subHeaderText={ subHeaderText() }
						align="left"
					/>
				}
				categoriesFooter={ renderCategoriesFooter() }
				// disable premium themes for now, because we can't access checkout
				isPremiumThemeAvailable={ false }
			/>
			{ renderCheckoutModal() }
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

// Ensures Blog category appears at the top of the design category list
// (directly below the All Themes category).
function sortBlogToTop( a: Category, b: Category ) {
	if ( a.slug === b.slug ) {
		return 0;
	} else if ( a.slug === 'blog' ) {
		return -1;
	} else if ( b.slug === 'blog' ) {
		return 1;
	}
	return 0;
}
// Ensures store category appears at the top of the design category list
// (directly below the All Themes category).
function sortStoreToTop( a: Category, b: Category ) {
	if ( a.slug === b.slug ) {
		return 0;
	} else if ( a.slug === 'store' ) {
		return -1;
	} else if ( b.slug === 'store' ) {
		return 1;
	}
	return 0;
}

export default designSetup;
