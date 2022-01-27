import { isEnabled } from '@automattic/calypso-config';
import { planHasFeature, FEATURE_PREMIUM_THEMES, PLAN_PREMIUM } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import DesignPicker, {
	FeaturedPicksButtons,
	PremiumBadge,
	isBlankCanvasDesign,
	getDesignUrl,
	useCategorization,
	useThemeDesignsQuery,
} from '@automattic/design-picker';
import { englishLocales } from '@automattic/i18n-utils';
import { shuffle } from '@automattic/js-utils';
import { useViewportMatch } from '@wordpress/compose';
import classnames from 'classnames';
import { getLocaleSlug, useTranslate } from 'i18n-calypso';
import page from 'page';
import PropTypes from 'prop-types';
import { useEffect, useLayoutEffect, useMemo, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FormattedHeader from 'calypso/components/formatted-header';
import WebPreview from 'calypso/components/web-preview';
import { useBlockEditorSettingsQuery } from 'calypso/data/block-editor/use-block-editor-settings-query';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import AsyncCheckoutModal from 'calypso/my-sites/checkout/modal/async';
import { openCheckoutModal } from 'calypso/my-sites/checkout/modal/utils';
import StepWrapper from 'calypso/signup/step-wrapper';
import { getStepUrl } from 'calypso/signup/utils';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';
import { getSiteId } from 'calypso/state/sites/selectors';
import DIFMThemes from '../difm-design-picker/themes';
import LetUsChoose from './let-us-choose';
import PreviewToolbar from './preview-toolbar';
import './style.scss';

export default function DesignPickerStep( props ) {
	const {
		flowName,
		stepName,
		isReskinned,
		queryParams,
		showDesignPickerCategories,
		showLetUsChoose,
		hideFullScreenPreview,
		hideDesignTitle,
		signupDependencies: dependencies,
		sitePlanSlug,
	} = props;

	const isPremiumThemeAvailable = useMemo(
		() => planHasFeature( sitePlanSlug, FEATURE_PREMIUM_THEMES ),
		[ sitePlanSlug ]
	);

	const userLoggedIn = useSelector( ( state ) => isUserLoggedIn( state ) );

	// In order to show designs with a "featured" term in the theme_picks taxonomy at the below of categories filter
	const useFeaturedPicksButtons =
		showDesignPickerCategories && isEnabled( 'signup/design-picker-use-featured-picks-buttons' );

	const dispatch = useDispatch();
	const translate = useTranslate();

	const [ selectedDesign, setSelectedDesign ] = useState( null );
	const scrollTop = useRef( 0 );
	const tier =
		isPremiumThemeAvailable || isEnabled( 'signup/design-picker-premium-themes-checkout' )
			? 'all'
			: 'free';

	// Limit themes to those that support the Site editor, if site is fse eligible
	const siteId = useSelector( ( state ) => getSiteId( state, dependencies.siteSlug ) );
	const {
		isLoading: blockEditorSettingsAreLoading,
		data: blockEditorSettings,
	} = useBlockEditorSettingsQuery( siteId, userLoggedIn && ! props.useDIFMThemes );
	const isFSEEligible = blockEditorSettings?.is_fse_eligible ?? false;
	const themeFilters = isFSEEligible
		? 'auto-loading-homepage,block-templates'
		: 'auto-loading-homepage';

	const { data: apiThemes = [] } = useThemeDesignsQuery(
		{ filter: themeFilters, tier },
		// Wait until block editor settings have loaded to load themes
		{ enabled: ! props.useDIFMThemes && ! blockEditorSettingsAreLoading }
	);

	const allThemes = props.useDIFMThemes ? DIFMThemes : apiThemes;

	useEffect(
		() => {
			dispatch( saveSignupStep( { stepName: props.stepName } ) );
		},
		// Ignoring dependencies because we only want to save the step on first mount
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]
	);

	// Update Scroll position when section changes
	useLayoutEffect( () => {
		let timeoutID;
		if ( props.stepSectionName ) {
			scrollTop.current = document.scrollingElement.scrollTop;
		} else {
			// Defer restore scroll position to ensure DesignPicker is rendered
			timeoutID = window.setTimeout( () => {
				document.scrollingElement.scrollTop = scrollTop.current;
			} );
		}

		return () => {
			timeoutID && window.clearTimeout( timeoutID );
		};
	}, [ props.stepSectionName ] );

	const { designs, featuredPicksDesigns } = useMemo( () => {
		return {
			designs: shuffle( allThemes.filter( ( theme ) => ! theme.is_featured_picks ) ),
			featuredPicksDesigns: allThemes.filter( ( theme ) => theme.is_featured_picks ),
		};
	}, [ allThemes ] );

	// Update the selected design when the section changes
	useEffect( () => {
		setSelectedDesign( designs.find( ( { theme } ) => theme === props.stepSectionName ) );
	}, [ designs, props.stepSectionName, setSelectedDesign ] );

	const getCategorizationOptionsForStep = () => {
		const result = {
			showAllFilter: props.showDesignPickerCategoriesAllFilter,
		};
		const intent = props.signupDependencies.intent;
		switch ( intent ) {
			case 'write':
				result.defaultSelection = 'blog';
				result.sort = sortBlogToTop;
				break;
			case 'sell':
				// @TODO: This should be 'ecommerce' once we have some themes with that slug.
				result.defaultSelection = 'business';
				result.sort = sortEcommerceToTop;
				break;
			default:
				result.defaultSelection = null;
				result.sort = sortBlogToTop;
				break;
		}
		return result;
	};
	const categorization = useCategorization( designs, getCategorizationOptionsForStep() );

	function pickDesign( _selectedDesign, additionalDependencies = {} ) {
		// Design picker preview will submit the defaultDependencies via next button,
		// So only do this when the user picks the design directly
		dispatch(
			submitSignupStep(
				{
					stepName: props.stepName,
				},
				{
					selectedDesign: _selectedDesign,
					selectedSiteCategory: categorization.selection,
					...additionalDependencies,
				}
			)
		);

		submitDesign( _selectedDesign );
	}

	function previewDesign( _selectedDesign ) {
		const locale = ! userLoggedIn ? getLocaleSlug() : '';

		recordTracksEvent( 'calypso_signup_design_preview_select', {
			theme: _selectedDesign?.stylesheet ?? `pub/${ _selectedDesign.theme }`,
			template: _selectedDesign.template,
			flow: props.flowName,
			intent: props.signupDependencies.intent,
		} );
		page(
			getStepUrl( props.flowName, props.stepName, _selectedDesign.theme, locale, queryParams )
		);
	}

	function upgradePlan() {
		openCheckoutModal( [ PLAN_PREMIUM ] );
	}

	function submitDesign( _selectedDesign = selectedDesign ) {
		recordTracksEvent( 'calypso_signup_select_design', {
			theme: _selectedDesign?.stylesheet ?? `pub/${ _selectedDesign?.theme }`,
			template: _selectedDesign?.template,
			flow: props.flowName,
			intent: props.signupDependencies.intent,
		} );

		props.goToNextStep();
	}

	function renderCheckoutModal() {
		if ( ! isEnabled( 'signup/design-picker-premium-themes-checkout' ) ) {
			return null;
		}

		return <AsyncCheckoutModal />;
	}

	function renderDesignPicker() {
		return (
			<>
				<DesignPicker
					designs={ useFeaturedPicksButtons ? designs : [ ...featuredPicksDesigns, ...designs ] }
					theme={ isReskinned ? 'light' : 'dark' }
					locale={ translate.localeSlug }
					onSelect={ pickDesign }
					onPreview={ previewDesign }
					onUpgrade={ upgradePlan }
					className={ classnames( {
						'design-picker-step__has-categories': showDesignPickerCategories,
					} ) }
					highResThumbnails
					premiumBadge={ <PremiumBadge /> }
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
					hideFullScreenPreview={ hideFullScreenPreview }
					hideDesignTitle={ hideDesignTitle }
					isPremiumThemeAvailable={ isPremiumThemeAvailable }
				/>
				{ renderCheckoutModal() }
			</>
		);
	}

	function renderCategoriesFooter() {
		return (
			<>
				{ useFeaturedPicksButtons && (
					<FeaturedPicksButtons designs={ featuredPicksDesigns } onSelect={ pickDesign } />
				) }
				{ showLetUsChoose && (
					<LetUsChoose flowName={ props.flowName } designs={ designs } onSelect={ pickDesign } />
				) }
			</>
		);
	}

	function renderDesignPreview() {
		const {
			signupDependencies: { siteSlug, siteTitle, intent },
			hideExternalPreview,
		} = props;

		const previewUrl = getDesignUrl( selectedDesign, translate.localeSlug, {
			iframe: true,
			// If the user fills out the site title with write intent, we show it on the design preview
			// Otherwise, use the title of selected design directly
			site_title: intent === 'write' && siteTitle ? siteTitle : selectedDesign?.title,
		} );

		return (
			<>
				<WebPreview
					className="design-picker__web-preview"
					showPreview
					isContentOnly
					showClose={ false }
					showEdit={ false }
					externalUrl={ siteSlug }
					showExternal={ ! hideExternalPreview }
					previewUrl={ previewUrl }
					loadingMessage={ translate(
						'{{strong}}One moment, please…{{/strong}} loading your site.',
						{
							components: { strong: <strong /> },
						}
					) }
					toolbarComponent={ PreviewToolbar }
				/>
				{ renderCheckoutModal() }
			</>
		);
	}

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

		if ( englishLocales.includes( translate.localeSlug ) ) {
			// An English only trick so the line wraps between sentences.
			return text
				.replace( /\s/g, '\xa0' ) // Replace all spaces with non-breaking spaces
				.replace( /\.\s/g, '. ' ); // Replace all spaces at the end of sentences with a regular breaking space
		}

		return text;
	}

	function skipLabelText() {
		const { signupDependencies } = props;

		if ( signupDependencies?.intent === 'write' ) {
			return translate( 'Skip and draft first post' );
		}

		// Fall back to the default skip label used by <StepWrapper>
		return undefined;
	}

	const isMobile = useViewportMatch( 'small', '<' );

	if ( selectedDesign ) {
		const isBlankCanvas = isBlankCanvasDesign( selectedDesign );
		const designTitle = isBlankCanvas ? translate( 'Blank Canvas' ) : selectedDesign.title;
		const defaultDependencies = { selectedDesign };
		const locale = ! userLoggedIn ? getLocaleSlug() : '';
		const shouldUpgrade = selectedDesign.is_premium && ! isPremiumThemeAvailable;

		return (
			<StepWrapper
				{ ...props }
				className="design-picker__preview"
				fallbackHeaderText={ designTitle }
				headerText={ designTitle }
				fallbackSubHeaderText={ '' }
				subHeaderText={ '' }
				stepContent={ renderDesignPreview() }
				align={ isMobile ? 'left' : 'center' }
				hideSkip
				hideNext={ shouldUpgrade }
				nextLabelText={ translate( 'Start with %(designTitle)s', { args: { designTitle } } ) }
				defaultDependencies={ defaultDependencies }
				backUrl={ getStepUrl( flowName, stepName, '', locale, queryParams ) }
				goToNextStep={ submitDesign }
				stepSectionName={ designTitle }
				customizedActionButtons={
					shouldUpgrade && (
						<Button primary borderless={ false } onClick={ upgradePlan }>
							{ translate( 'Upgrade Plan' ) }
						</Button>
					)
				}
			/>
		);
	}

	const headerProps = showDesignPickerCategories
		? { hideFormattedHeader: true }
		: {
				fallbackHeaderText: headerText(),
				headerText: headerText(),
				fallbackSubHeaderText: subHeaderText(),
				subHeaderText: subHeaderText(),
		  };

	return (
		<StepWrapper
			{ ...props }
			className={ classnames( {
				'design-picker__has-categories': showDesignPickerCategories,
			} ) }
			{ ...headerProps }
			stepContent={ renderDesignPicker() }
			align={ isReskinned ? 'left' : 'center' }
			skipButtonAlign={ isReskinned ? 'top' : 'bottom' }
			skipLabelText={ skipLabelText() }
		/>
	);
}

DesignPickerStep.propTypes = {
	goToNextStep: PropTypes.func.isRequired,
	signupDependencies: PropTypes.object.isRequired,
	stepName: PropTypes.string.isRequired,
};

// Ensures Blog category appears at the top of the design category list
// (directly below the All Themes category).
function sortBlogToTop( a, b ) {
	if ( a.slug === b.slug ) {
		return 0;
	} else if ( a.slug === 'blog' ) {
		return -1;
	} else if ( b.slug === 'blog' ) {
		return 1;
	}
	return 0;
}
// Ensures Ecommerce category appears at the top of the design category list
// (directly below the All Themes category).
// @TODO: This should be 'ecommerce' once we have some themes with that slug.
function sortEcommerceToTop( a, b ) {
	if ( a.slug === b.slug ) {
		return 0;
	} else if ( a.slug === 'business' ) {
		return -1;
	} else if ( b.slug === 'business' ) {
		return 1;
	}
	return 0;
}
