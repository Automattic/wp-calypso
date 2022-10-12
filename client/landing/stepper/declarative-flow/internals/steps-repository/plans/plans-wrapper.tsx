// import { subscribeIsDesktop } from '@automattic/viewport';
import { getPlan, PLAN_FREE } from '@automattic/calypso-products';
import { getUrlParts } from '@automattic/calypso-url';
import { useLocale } from '@automattic/i18n-utils';
import { addPlanToCart } from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import { localize, useTranslate } from 'i18n-calypso';
import React, { useEffect } from 'react';
import { useSelector, connect } from 'react-redux';
import { NEWSLETTER_FLOW, Notice } from 'calypso/../packages/onboarding/src';
import QueryPlans from 'calypso/components/data/query-plans';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import MarketingMessage from 'calypso/components/marketing-message';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { ProvideExperimentData } from 'calypso/lib/explat';
import PlansFeaturesMain from 'calypso/my-sites/plans-features-main';
import StepWrapper from 'calypso/signup/step-wrapper';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getPlanSlug } from 'calypso/state/plans/selectors';
import { submitSignupStep } from 'calypso/state/signup/progress/actions';
import { getSiteType } from 'calypso/state/signup/steps/site-type/selectors';
import { ONBOARD_STORE } from '../../../../stores';
import './style.scss';

interface Props {
	flowName: string;
	stepName: string;
	siteType: string;
	planSlug: string;
	site: any;
	onSubmit: () => void;
	plansLoaded: boolean;
	processStep: ( step: any ) => void;
}

const PlansWrapper: React.FC< Props > = ( props ) => {
	const { userLoggedIn } = useSelector( ( state ) => {
		return {
			userLoggedIn: isUserLoggedIn( state ),
		};
	} );

	const { signupValues } = useSelect( ( select ) => {
		return {
			signupValues: select( ONBOARD_STORE ).getSignupValues(),
		};
	} );

	const { setPendingAction } = useDispatch( ONBOARD_STORE );

	const site = useSite();
	const locale = useLocale();
	const { __ } = useI18n();
	const [ isDesktop, setIsDesktop ] = React.useState( true );

	const disableBloggerPlanWithNonBlogDomain = undefined;
	const hideFreePlan = signupValues?.shouldHideFreePlan;
	const isLaunchPage = undefined;
	const showTreatmentPlansReorderTest = false;
	const isReskinned = true;
	const customerType = 'personal';
	const positionInFlow = undefined;
	const isInVerticalScrollingPlansExperiment = true;
	const planTypes = undefined;
	const headerText = 'Choose a plan';
	// const signupDependencies = {
	// 	emailItem: undefined,
	// };
	const translate = useTranslate();
	useEffect( () => {
		setIsDesktop( isDesktop );
	}, [] );

	const onSelectPlan = async ( cartItem: any ) => {
		const { stepSectionName, stepName, flowName } = props;

		if ( cartItem ) {
			recordTracksEvent( 'calypso_signup_plan_select', {
				product_slug: cartItem.product_slug,
				free_trial: cartItem.free_trial,
				from_section: stepSectionName ? stepSectionName : 'default',
			} );
		} else {
			recordTracksEvent( 'calypso_signup_free_plan_select', {
				from_section: stepSectionName ? stepSectionName : 'default',
			} );
		}

		const step = {
			stepName,
			stepSectionName,
			cartItem,
		};

		if ( flowName === NEWSLETTER_FLOW ) {
			submitSignupStep( step, {
				comingSoon: 0,
			} );
		} else {
			submitSignupStep( step, {} );
		}
		setPendingAction( async ( dependencies ) => {
			const { siteSlug } = dependencies;
			await addPlanToCart( siteSlug, cartItem, flowName, userLoggedIn );

			return dependencies;
		}, true );

		props.onSubmit?.();
	};

	const getDomainName = () => {
		return signupValues?.domainItem && signupValues.domainItem.meta;
	};

	const handleFreePlanButtonClick = () => {
		onSelectPlan( null ); // onUpgradeClick expects a cart item -- null means Free Plan.
		props.onSubmit();
	};

	const renderLoading = () => {
		return (
			<div className="plans__loading">
				<LoadingEllipsis className="active" />
			</div>
		);
	};

	const getIntervalType = () => {
		const urlParts = getUrlParts( typeof window !== 'undefined' ? window.location?.href : '' );
		const intervalType = urlParts?.searchParams.get( 'intervalType' );

		if ( [ 'yearly', 'monthly' ].includes( intervalType ) ) {
			return intervalType;
		}

		// Default value
		return 'yearly';
	};

	const plansFeaturesList = () => {
		const { flowName } = props;

		let errorDisplay;
		if ( 'invalid' === props.step?.status ) {
			errorDisplay = (
				<div>
					<Notice status="is-error" showDismiss={ false }>
						{ props.step.errors.message }
					</Notice>
				</div>
			);
		}

		if ( ! props.plansLoaded ) {
			return renderLoading();
		}

		return (
			<div>
				{ errorDisplay }
				<ProvideExperimentData
					name="calypso_signup_plans_step_faq_202209_v2"
					options={ {
						isEligible:
							[ 'en-gb', 'en' ].includes( locale ) && 'onboarding' === flowName && isDesktop,
					} }
				>
					{ ( isLoading, experimentAssignment ) => {
						if ( isLoading ) {
							return renderLoading();
						}

						return (
							<PlansFeaturesMain
								site={ site || {} } // `PlanFeaturesMain` expects a default prop of `{}` if no site is provided
								hideFreePlan={ hideFreePlan }
								isInSignup={ true }
								isLaunchPage={ isLaunchPage }
								intervalType={ getIntervalType() }
								onUpgradeClick={ onSelectPlan }
								showFAQ={ false }
								domainName={ getDomainName() }
								customerType={ customerType }
								disableBloggerPlanWithNonBlogDomain={ disableBloggerPlanWithNonBlogDomain }
								plansWithScroll={ isDesktop }
								planTypes={ planTypes }
								flowName={ flowName }
								showTreatmentPlansReorderTest={ showTreatmentPlansReorderTest }
								isAllPaidPlansShown={ true }
								isInVerticalScrollingPlansExperiment={ isInVerticalScrollingPlansExperiment }
								shouldShowPlansFeatureComparison={ isDesktop } // Show feature comparison layout in signup flow and desktop resolutions
								isReskinned={ isReskinned }
								isFAQCondensedExperiment={
									experimentAssignment?.variationName === 'treatment_condensed'
								}
								isFAQExperiment={
									experimentAssignment?.variationName === 'treatment_expanded' ||
									experimentAssignment?.variationName === 'treatment_condensed'
								}
							/>
						);
					} }
				</ProvideExperimentData>
			</div>
		);
	};

	const getHeaderText = () => {
		if ( headerText ) {
			return headerText;
		}

		if ( isDesktop ) {
			return __( 'Choose a plan' );
		}

		return __( "Pick a plan that's right for you." );
	};

	const getSubHeaderText = () => {
		const { flowName } = props;

		const freePlanButton = (
			<Button onClick={ handleFreePlanButtonClick } className="is-borderless" />
		);

		if ( flowName === NEWSLETTER_FLOW ) {
			return hideFreePlan
				? __( 'Unlock a powerful bundle of features for your Newsletter.' )
				: translate(
						`Unlock a powerful bundle of features for your Newsletter. Or {{link}}start with a free plan{{/link}}.`,
						{ components: { link: freePlanButton } }
				  );
		}

		return hideFreePlan
			? __( 'Unlock a powerful bundle of features for your Link in Bio.' )
			: translate(
					`Unlock a powerful bundle of features for your Link in Bio. Or {{link}}start with a free plan{{/link}}.`,
					{ components: { link: freePlanButton } }
			  );
	};

	const plansFeaturesSelection = () => {
		const { flowName, stepName } = props;

		const headerText = getHeaderText();
		const fallbackHeaderText = headerText;
		const subHeaderText = getSubHeaderText();
		const fallbackSubHeaderText = subHeaderText;

		let queryParams;

		return (
			<>
				<StepWrapper
					flowName={ flowName }
					stepName={ stepName }
					positionInFlow={ positionInFlow }
					shouldHideNavButtons={ true }
					fallbackHeaderText={ fallbackHeaderText }
					fallbackSubHeaderText={ fallbackSubHeaderText }
					isWideLayout={ true }
					stepContent={ plansFeaturesList() }
					allowBackFirstStep={ false }
					queryParams={ queryParams }
				/>
			</>
		);
	};

	const classes = classNames( 'plans plans-step', {
		'in-vertically-scrolled-plans-experiment': isInVerticalScrollingPlansExperiment,
		'has-no-sidebar': true,
		'is-wide-layout': true,
	} );

	return (
		<div className="stepper-plans">
			<QueryPlans />
			<MarketingMessage path="signup/plans" />
			<div className={ classes }>{ plansFeaturesSelection() }</div>
		</div>
	);
};

export default connect( ( state ) => {
	return {
		siteType: getSiteType( state ),
		plansLoaded: Boolean( getPlanSlug( state, getPlan( PLAN_FREE )?.getProductId() || 0 ) ),
	};
} )( localize( PlansWrapper ) );
