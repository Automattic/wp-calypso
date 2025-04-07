import {
	PLAN_PREMIUM,
	WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED,
} from '@automattic/calypso-products';
import { PremiumBadge } from '@automattic/components';
import { isBlankCanvasDesign, useThemeDesignsQuery } from '@automattic/design-picker';
import { englishLocales } from '@automattic/i18n-utils';
import { shuffle } from '@automattic/js-utils';
import { addQueryArgs } from '@wordpress/url';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import FormattedHeader from 'calypso/components/formatted-header';
import { THEME_TIER_PARTNER, THEME_TIER_PREMIUM } from 'calypso/components/theme-tier/constants';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { triggerGuidesForStep } from 'calypso/lib/guides/trigger-guides-for-step';
import StepWrapper from 'calypso/signup/step-wrapper';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';
import { getSiteId } from 'calypso/state/sites/selectors';
import DesignPicker from './design-picker';
import LetUsChoose from './let-us-choose';
import { useCategorization } from './use-categorization';
import './style.scss';

export default function DesignPickerStep( props ) {
	const {
		flowName,
		stepName,
		showDesignPickerCategories,
		showLetUsChoose,
		hideFullScreenPreview,
		hideDesignTitle,
		hideDescription,
		hideBadge,
		useDIFMThemes,
		signupDependencies: dependencies,
	} = props;

	const siteId = useSelector( ( state ) => getSiteId( state, dependencies.siteSlug ) );
	const isPremiumThemeAvailable = useSelector( ( state ) =>
		siteHasFeature( state, siteId, WPCOM_FEATURES_PREMIUM_THEMES_UNLIMITED )
	);

	const dispatch = useDispatch();
	const translate = useTranslate();

	const scrollTop = useRef( 0 );

	const getThemeFilters = () => {
		if ( useDIFMThemes ) {
			const isDIFMStoreFlow = 'do-it-for-me-store' === props.flowName;
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
			dispatch( saveSignupStep( { stepName: stepName } ) );
			triggerGuidesForStep( flowName, stepName );
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

	const designs = useMemo( () => {
		const filteredThemes = apiThemes.filter( ( theme ) => ! isBlankCanvasDesign( theme ) );
		if ( useDIFMThemes ) {
			return filteredThemes;
		}
		return shuffle( filteredThemes );
	}, [ apiThemes, useDIFMThemes ] );

	const getEventPropsByDesign = ( design ) => ( {
		theme: design?.stylesheet ?? `pub/${ design?.theme }`,
		template: design?.template,
		tier: design?.design_tier,
		is_premium: design?.design_tier === THEME_TIER_PREMIUM,
		is_externally_managed: design?.design_tier === THEME_TIER_PARTNER,
		flow: flowName,
		intent: dependencies.intent,
	} );

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

	function upgradePlan() {
		const relativeCurrentPath = window.location.href.replace( window.location.origin, '' );
		const checkoutUrl = addQueryArgs( `/checkout/${ siteId }/${ PLAN_PREMIUM }`, {
			redirect_to: relativeCurrentPath,
			cancel_to: relativeCurrentPath,
			signup: '1',
		} );

		window.location.href = checkoutUrl;
	}

	function upgradePlanFromDesignPicker( design ) {
		recordTracksEvent(
			'calypso_signup_design_upgrade_button_click',
			getEventPropsByDesign( design )
		);
		upgradePlan();
	}

	function submitDesign( _selectedDesign ) {
		recordTracksEvent( 'calypso_signup_select_design', getEventPropsByDesign( _selectedDesign ) );
		props.goToNextStep();
	}

	function renderDesignPicker() {
		return (
			<>
				<DesignPicker
					designs={ designs }
					theme="light"
					locale={ translate.localeSlug }
					onSelect={ pickDesign }
					onUpgrade={ upgradePlanFromDesignPicker }
					className={ clsx( {
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

	function headerText() {
		if ( useDIFMThemes ) {
			return translate( 'Design' );
		}

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

		if ( useDIFMThemes ) {
			return translate(
				'We create a custom design based on the content you submit after checkout. Optionally, select a design to suggest inspiration.'
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
			className={ clsx( {
				'design-picker__has-categories': showDesignPickerCategories,
				'design-picker__hide-category-column': useDIFMThemes || 'sell' === intent,
			} ) }
			{ ...headerProps }
			stepContent={ renderDesignPicker() }
			align="left"
			skipButtonAlign="top"
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
