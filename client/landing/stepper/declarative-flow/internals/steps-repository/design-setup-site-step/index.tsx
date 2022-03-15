import { isEnabled } from '@automattic/calypso-config';
import { planHasFeature, FEATURE_PREMIUM_THEMES, PLAN_PREMIUM } from '@automattic/calypso-products';
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
import { useMobileBreakpoint } from '@automattic/viewport-react';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useMemo, useState } from 'react';
// import { useSelector } from 'react-redux';
import FormattedHeader from 'calypso/components/formatted-header';
import WebPreview from 'calypso/components/web-preview';
// import { useBlockEditorSettingsQuery } from 'calypso/data/block-editor/use-block-editor-settings-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import AsyncCheckoutModal from 'calypso/my-sites/checkout/modal/async';
import { openCheckoutModal } from 'calypso/my-sites/checkout/modal/utils';
// import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
// import { getSignupDependencyStore } from 'calypso/state/signup/dependency-store/selectors';
// import { getSiteId } from 'calypso/state/sites/selectors';
import PreviewToolbar from './preview-toolbar';
import type { Step } from '../../types';
import './style.scss';
import type { Design, Category } from '@automattic/design-picker';

/**
 * The design picker step
 */
const DesignSetupSite: Step = function DesignSetupSite( { navigation } ) {
	const isMobile = useMobileBreakpoint();
	const { goNext, goBack } = navigation;
	const translate = useTranslate();
	const locale = useLocale();
	// // const signupDependencies = useSelector( ( state ) => getSignupDependencyStore( state ) );

	// // TODO EMN: These values should come from state
	const flowName = 'setup-site';
	const intent = 'builder';
	const siteSlug = 'site-slug';
	const siteTitle = 'site title';
	const isReskinned = true;
	const sitePlanSlug = 'free_plan';

	const [ selectedDesign, setSelectedDesign ] = useState< Design | undefined >( undefined );

	const showDesignPickerCategories = isEnabled( 'signup/design-picker-categories' );
	const showDesignPickerCategoriesAllFilter = isEnabled( 'signup/design-picker-categories' );

	// // In order to show designs with a "featured" term in the theme_picks taxonomy at the below of categories filter
	const useFeaturedPicksButtons =
		showDesignPickerCategories && isEnabled( 'signup/design-picker-use-featured-picks-buttons' );
	const isPremiumThemeAvailable = useMemo(
		() => planHasFeature( sitePlanSlug, FEATURE_PREMIUM_THEMES ),
		[ sitePlanSlug ]
	);

	const tier =
		isPremiumThemeAvailable || isEnabled( 'signup/design-picker-premium-themes-checkout' )
			? 'all'
			: 'free';

	// // // Limit themes to those that support the Site editor, if site is fse eligible
	// TODO EMN: This needs redux
	// const siteId = useSelector( ( state ) => getSiteId( state, siteSlug ) );
	const blockEditorSettingsAreLoading = false;
	const blockEditorSettings = {
		is_fse_eligible: true,
	};

	const userLoggedIn = false; //useSelector( ( state ) => isUserLoggedIn( state ) );
	// TODO EMN: This will work when we have a store
	// // // const {
	// // // 	isLoading: blockEditorSettingsAreLoading,
	// // // 	data: blockEditorSettings,
	// // // } = useBlockEditorSettingsQuery( siteId, userLoggedIn );
	const isFSEEligible = blockEditorSettings?.is_fse_eligible ?? false;
	const themeFilters = isFSEEligible
		? 'auto-loading-homepage,full-site-editing'
		: 'auto-loading-homepage';

	const { data: apiThemes = [] } = useThemeDesignsQuery(
		{ filter: themeFilters, tier },
		// Wait until block editor settings have loaded to load themes
		{ enabled: ! blockEditorSettingsAreLoading }
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
			return text
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

	function pickDesign( _selectedDesign: Design ) {
		setSelectedDesign( _selectedDesign );
	}

	function previewDesign( _selectedDesign: Design ) {
		recordTracksEvent(
			'calypso_signup_design_preview_select',
			getEventPropsByDesign( _selectedDesign )
		);

		// TODO EMN: What to do when Preview? For the moment just select the design
		setSelectedDesign( _selectedDesign );
		// page(
		// 	getStepUrl( props.flowName, props.stepName, _selectedDesign.theme, locale, queryParams )
		// );
	}

	function upgradePlan() {
		openCheckoutModal( [ PLAN_PREMIUM ] );
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
		} else {
			goBack();
		}
	};

	let stepContent = <div />;

	if ( selectedDesign ) {
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
			<div>PREVIEW</div>
			/* <WebPreview
				className="design-picker__web-preview"
				showPreview
				isContentOnly
				showClose={ false }
				showEdit={ false }
				externalUrl={ siteSlug }
				showExternal={ true }
				previewUrl={ 'url test' }
				loadingMessage={ translate(
					'{{strong}}One moment, please…{{/strong}} loading your site.',
					{
						components: { strong: <strong /> },
					}
				) }
				toolbarComponent={ PreviewToolbar }
			/> */
		);

		return (
			<StepContainer
				stepContent={ stepContent }
				hideSkip
				hideNext={ shouldUpgrade }
				className={ 'design-setup-site-step__preview' }
				nextLabelText={ translate( 'Start with %(designTitle)s', { args: { designTitle } } ) }
				goBack={ handleBackClick }
				goNext={ goNext }
				formattedHeader={
					<FormattedHeader
						id={ 'design-setup-header' }
						headerText={ designTitle }
						align={ isMobile ? 'left' : 'center' }
					/>
				}
				customizedActionButtons={
					shouldUpgrade && (
						<Button primary borderless={ false } onClick={ upgradePlan }>
							{ translate( 'Upgrade Plan' ) }
						</Button>
					)
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
				// onUpgrade={ upgradePlan }
				className={ classnames( {
					'design-setup-site-step__has-categories': showDesignPickerCategories,
				} ) }
				highResThumbnails
				premiumBadge={ <PremiumBadge isPremiumThemeAvailable={ isPremiumThemeAvailable } /> }
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
				isPremiumThemeAvailable={ isPremiumThemeAvailable }
			/>
			{ renderCheckoutModal() }
		</>
	);

	return (
		<StepContainer
			className={ classnames( 'design-setup-site-step', {
				'design-picker__has-categories': showDesignPickerCategories,
			} ) }
			skipButtonAlign={ 'top' }
			skipLabelText={ intent === 'write' ? translate( 'Skip and draft first post' ) : undefined }
			stepContent={ stepContent }
			recordTracksEvent={ recordTracksEvent }
			goNext={ goNext }
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

export default DesignSetupSite;
