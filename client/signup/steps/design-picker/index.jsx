import { PLAN_PREMIUM, WPCOM_FEATURES_PREMIUM_THEMES } from '@automattic/calypso-products';
import { Button } from '@automattic/components';
import DesignPicker, {
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
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import AsyncCheckoutModal from 'calypso/my-sites/checkout/modal/async';
import { openCheckoutModal } from 'calypso/my-sites/checkout/modal/utils';
import StepWrapper from 'calypso/signup/step-wrapper';
import { getStepUrl } from 'calypso/signup/utils';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';
import { getSiteId } from 'calypso/state/sites/selectors';
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
		hideDescription,
		hideBadge,
		signupDependencies: dependencies,
	} = props;

	const siteId = useSelector( ( state ) => getSiteId( state, dependencies.siteSlug ) );
	const isPremiumThemeAvailable = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_PREMIUM_THEMES )
	);

	const userLoggedIn = useSelector( ( state ) => isUserLoggedIn( state ) );

	const dispatch = useDispatch();
	const translate = useTranslate();

	const [ selectedDesign, setSelectedDesign ] = useState( null );
	const scrollTop = useRef( 0 );

	const isDIFMStoreFlow = 'do-it-for-me-store' === props.flowName;

	const getThemeFilters = () => {
		if ( props.useDIFMThemes ) {
			return isDIFMStoreFlow ? 'do-it-for-me-store' : 'do-it-for-me';
		}

		return 'auto-loading-homepage,full-site-editing';
	};

	const { data: apiThemes = [] } = useThemeDesignsQuery( {
		filter: getThemeFilters(),
		tier: 'all',
	} );

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

	const designs = useMemo(
		() => shuffle( apiThemes.filter( ( theme ) => ! isBlankCanvasDesign( theme ) ) ),
		[ apiThemes ]
	);

	const getEventPropsByDesign = ( design ) => ( {
		theme: design?.stylesheet ?? `pub/${ design?.theme }`,
		template: design?.template,
		is_premium: design?.is_premium,
		flow: flowName,
		intent: dependencies.intent,
	} );

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

		recordTracksEvent(
			'calypso_signup_design_preview_select',
			getEventPropsByDesign( _selectedDesign )
		);

		page(
			getStepUrl( props.flowName, props.stepName, _selectedDesign.theme, locale, queryParams )
		);
	}

	function upgradePlan() {
		openCheckoutModal( [ PLAN_PREMIUM ] );
	}

	function upgradePlanFromDesignPicker( design ) {
		recordTracksEvent(
			'calypso_signup_design_upgrade_button_click',
			getEventPropsByDesign( design )
		);
		upgradePlan();
	}

	function upgradePlanFromPreview( design ) {
		recordTracksEvent(
			'calypso_signup_design_preview_upgrade_button_click',
			getEventPropsByDesign( design )
		);
		upgradePlan();
	}

	function submitDesign( _selectedDesign = selectedDesign ) {
		recordTracksEvent( 'calypso_signup_select_design', getEventPropsByDesign( _selectedDesign ) );
		props.goToNextStep();
	}

	function renderCheckoutModal() {
		return <AsyncCheckoutModal />;
	}

	function renderDesignPicker() {
		return (
			<>
				<DesignPicker
					designs={ designs }
					theme={ isReskinned ? 'light' : 'dark' }
					locale={ translate.localeSlug }
					onSelect={ pickDesign }
					onPreview={ previewDesign }
					onUpgrade={ upgradePlanFromDesignPicker }
					className={ classnames( {
						'design-picker-step__has-categories': showDesignPickerCategories,
					} ) }
					highResThumbnails
					premiumBadge={
						props.useDIFMThemes ? null : (
							<PremiumBadge isPremiumThemeAvailable={ isPremiumThemeAvailable } />
						)
					}
					categorization={ showDesignPickerCategories ? categorization : undefined }
					recommendedCategorySlug={ getCategorizationOptionsForStep().defaultSelection }
					categoriesHeading={
						<FormattedHeader
							id="step-header"
							headerText={ headerText() }
							subHeaderText={ subHeaderText() }
							align="left"
						/>
					}
					categoriesFooter={ renderCategoriesFooter() }
					hideFullScreenPreview={ hideFullScreenPreview }
					hideDesignTitle={ hideDesignTitle }
					hideDescription={ hideDescription }
					hideBadge={ hideBadge }
					isPremiumThemeAvailable={ isPremiumThemeAvailable }
				/>
				{ renderCheckoutModal() }
			</>
		);
	}

	function renderCategoriesFooter() {
		return (
			<>
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
				fallbackSubHeaderText=""
				subHeaderText=""
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
						<Button
							primary
							borderless={ false }
							onClick={ () => upgradePlanFromPreview( selectedDesign ) }
						>
							{ translate( 'Upgrade Plan' ) }
						</Button>
					)
				}
			/>
		);
	}

	const intent = props.signupDependencies.intent;
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
				'design-picker__sell-intent': 'sell' === intent || isDIFMStoreFlow,
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
// Ensures store category appears at the top of the design category list
// (directly below the All Themes category).
function sortStoreToTop( a, b ) {
	if ( a.slug === b.slug ) {
		return 0;
	} else if ( a.slug === 'store' ) {
		return -1;
	} else if ( b.slug === 'store' ) {
		return 1;
	}
	return 0;
}
