// import { subscribeIsDesktop } from '@automattic/viewport';
import { getPlan, PLAN_FREE } from '@automattic/calypso-products';
import { getUrlParts } from '@automattic/calypso-url';
import { Button } from '@automattic/components';
import { useLocale } from '@automattic/i18n-utils';
import { useMediaQuery } from '@wordpress/compose';
import { useSelect, useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import classNames from 'classnames';
import { localize, useTranslate } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';
import { NEWSLETTER_FLOW } from 'calypso/../packages/onboarding/src';
import QueryPlans from 'calypso/components/data/query-plans';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import MarketingMessage from 'calypso/components/marketing-message';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { ProvideExperimentData } from 'calypso/lib/explat';
import PlansFeaturesMain from 'calypso/my-sites/plans-features-main';
import StepWrapper from 'calypso/signup/step-wrapper';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getPlanSlug } from 'calypso/state/plans/selectors';
import { getSiteType } from 'calypso/state/signup/steps/site-type/selectors';
import { ONBOARD_STORE } from '../../../../stores';
import './style.scss';

interface Props {
	flowName: string;
	siteType: string;
	onSubmit: () => void;
	plansLoaded: boolean;
}

const PlansWrapper: React.FC< Props > = ( props ) => {
	const { hideFreePlan, domainCartItem } = useSelect( ( select ) => {
		return {
			hideFreePlan: select( ONBOARD_STORE ).getHideFreePlan(),
			domainCartItem: select( ONBOARD_STORE ).getDomainCartItem(),
		};
	} );

	const { setPlanCartItem } = useDispatch( ONBOARD_STORE );

	const site = useSite();
	const locale = useLocale();
	const { __ } = useI18n();

	const isDesktop = useMediaQuery( '(min-width: 480px)' );
	const stepName = 'plans';
	const disableBloggerPlanWithNonBlogDomain = undefined;
	const isLaunchPage = undefined;
	const isReskinned = true;
	const customerType = 'personal';
	const positionInFlow = undefined;
	const isInVerticalScrollingPlansExperiment = true;
	const planTypes = undefined;
	const headerText = 'Choose a plan';

	const translate = useTranslate();

	const onSelectPlan = async ( selectedPlan: any ) => {
		if ( selectedPlan ) {
			recordTracksEvent( 'calypso_signup_plan_select', {
				product_slug: selectedPlan?.product_slug,
				free_trial: selectedPlan?.free_trial,
				from_section: 'default',
			} );
		} else {
			recordTracksEvent( 'calypso_signup_free_plan_select', {
				from_section: 'default',
			} );
		}

		setPlanCartItem( selectedPlan );
		props.onSubmit?.();
	};

	const getDomainName = () => {
		return domainCartItem?.meta;
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

		if ( ! props.plansLoaded ) {
			return renderLoading();
		}

		return (
			<div>
				{ /* check if it can be removed */ }
				<ProvideExperimentData
					name="calypso_signup_plans_step_faq_202209_v2"
					options={ {
						isEligible:
							[ 'en-gb', 'en' ].includes( locale ) && 'onboarding' === flowName && isDesktop,
					} }
				>
					{ /*  */ }
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
								showTreatmentPlansReorderTest={ false }
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
		if ( isDesktop ) {
			return headerText;
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
		const { flowName } = props;

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

	const classes = classNames( 'plans-step', {
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
