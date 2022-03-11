import {
	planHasFeature,
	FEATURE_UPLOAD_THEMES_PLUGINS,
	getPlan,
	PLAN_FREE,
} from '@automattic/calypso-products';
import { getUrlParts } from '@automattic/calypso-url';
import { Button } from '@automattic/components';
import { isDesktop, subscribeIsDesktop, isMobile } from '@automattic/viewport';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { parse as parseQs } from 'qs';
import { Component } from 'react';
import { connect } from 'react-redux';
import QueryPlans from 'calypso/components/data/query-plans';
import { LoadingEllipsis } from 'calypso/components/loading-ellipsis';
import MarketingMessage from 'calypso/components/marketing-message';
import Notice from 'calypso/components/notice';
import { getTld, isSubdomain } from 'calypso/lib/domains';
import { ProvideExperimentData } from 'calypso/lib/explat';
import { getSiteTypePropertyValue } from 'calypso/lib/signup/site-type';
import PlansComparison, { isEligibleForManagedPlan } from 'calypso/my-sites/plans-comparison';
import PlansFeaturesMain from 'calypso/my-sites/plans-features-main';
import StepWrapper from 'calypso/signup/step-wrapper';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { isTreatmentPlansReorderTest } from 'calypso/state/marketing/selectors';
import { getPlanSlug } from 'calypso/state/plans/selectors';
import hasInitializedSites from 'calypso/state/selectors/has-initialized-sites';
import { saveSignupStep, submitSignupStep } from 'calypso/state/signup/progress/actions';
import { getSiteType } from 'calypso/state/signup/steps/site-type/selectors';
import { getSiteBySlug } from 'calypso/state/sites/selectors';
import './style.scss';

export class PlansStep extends Component {
	state = {
		isDesktop: isDesktop(),
	};

	componentDidMount() {
		this.unsubscribe = subscribeIsDesktop( ( matchesDesktop ) =>
			this.setState( { isDesktop: matchesDesktop } )
		);
		this.props.saveSignupStep( { stepName: this.props.stepName } );
	}

	componentWillUnmount() {
		this.unsubscribe();
	}

	onSelectPlan = ( cartItem ) => {
		const { additionalStepData, stepSectionName, stepName, flowName } = this.props;

		if ( cartItem ) {
			this.props.recordTracksEvent( 'calypso_signup_plan_select', {
				product_slug: cartItem.product_slug,
				free_trial: cartItem.free_trial,
				from_section: stepSectionName ? stepSectionName : 'default',
			} );

			// If we're inside the store signup flow and the cart item is a Business or eCommerce Plan,
			// set a flag on it. It will trigger Automated Transfer when the product is being
			// activated at the end of the checkout process.
			if (
				flowName === 'ecommerce' &&
				planHasFeature( cartItem.product_slug, FEATURE_UPLOAD_THEMES_PLUGINS )
			) {
				cartItem.extra = Object.assign( cartItem.extra || {}, {
					is_store_signup: true,
				} );
			}
		} else {
			this.props.recordTracksEvent( 'calypso_signup_free_plan_select', {
				from_section: stepSectionName ? stepSectionName : 'default',
			} );
		}

		const step = {
			stepName,
			stepSectionName,
			cartItem,
			...additionalStepData,
		};

		this.props.submitSignupStep( step, {
			cartItem,
		} );
		this.props.goToNextStep();
	};

	getDomainName() {
		return (
			this.props.signupDependencies.domainItem && this.props.signupDependencies.domainItem.meta
		);
	}

	getCustomerType() {
		if ( this.props.customerType ) {
			return this.props.customerType;
		}

		const customerType =
			getSiteTypePropertyValue( 'slug', this.props.siteType, 'customerType' ) || 'personal';

		return customerType;
	}

	handleFreePlanButtonClick = () => {
		this.onSelectPlan( null ); // onUpgradeClick expects a cart item -- null means Free Plan.
	};

	getIntervalType( isTreatmentMonthlyDefault ) {
		const urlParts = getUrlParts( typeof window !== 'undefined' ? window.location?.href : '' );
		const intervalType = urlParts?.searchParams.get( 'intervalType' );

		if ( [ 'yearly', 'monthly' ].includes( intervalType ) ) {
			return intervalType;
		}

		if ( isTreatmentMonthlyDefault ) {
			return 'monthly';
		}

		// Default value
		return 'yearly';
	}

	plansFeaturesList() {
		const {
			disableBloggerPlanWithNonBlogDomain,
			hideFreePlan,
			isLaunchPage,
			selectedSite,
			planTypes,
			flowName,
			showTreatmentPlansReorderTest,
			isInVerticalScrollingPlansExperiment,
			isReskinned,
			eligibleForManagedPlan,
		} = this.props;

		let errorDisplay;
		if ( 'invalid' === this.props.step?.status ) {
			errorDisplay = (
				<div>
					<Notice status="is-error" showDismiss={ false }>
						{ this.props.step.errors.message }
					</Notice>
				</div>
			);
		}

		if ( ! this.props.plansLoaded ) {
			return this.renderLoading();
		}

		if ( eligibleForManagedPlan ) {
			return (
				<div>
					{ errorDisplay }
					<PlansComparison
						isInSignup={ true }
						onSelectPlan={ this.onSelectPlan }
						selectedSiteId={ selectedSite?.ID || undefined }
					/>
				</div>
			);
		}

		return (
			<ProvideExperimentData
				name="calypso_mobile_plans_page_with_billing"
				options={ { isEligible: isMobile() && 'onboarding' === this.props.flowName } }
			>
				{ ( isLoading, experimentAssignment ) => {
					if ( isLoading ) {
						return this.renderLoading();
					}

					// This allows us to continue with the other experiments.
					if ( ! experimentAssignment?.variationName ) {
						return this.renderSignUpMonthlyPlansExperiment( errorDisplay );
					}

					return (
						<div>
							{ errorDisplay }
							<PlansFeaturesMain
								site={ selectedSite || {} } // `PlanFeaturesMain` expects a default prop of `{}` if no site is provided
								hideFreePlan={ hideFreePlan }
								isInSignup={ true }
								isLaunchPage={ isLaunchPage }
								intervalType={ this.getIntervalType( false ) }
								isBillingWordingExperiment={ experimentAssignment?.variationName !== null }
								onUpgradeClick={ this.onSelectPlan }
								showFAQ={ false }
								domainName={ this.getDomainName() }
								customerType={ this.getCustomerType() }
								disableBloggerPlanWithNonBlogDomain={ disableBloggerPlanWithNonBlogDomain }
								plansWithScroll={ this.state.isDesktop }
								planTypes={ planTypes }
								flowName={ flowName }
								showTreatmentPlansReorderTest={ showTreatmentPlansReorderTest }
								isAllPaidPlansShown={ true }
								isInVerticalScrollingPlansExperiment={ isInVerticalScrollingPlansExperiment }
								shouldShowPlansFeatureComparison={ this.state.isDesktop } // Show feature comparison layout in signup flow and desktop resolutions
								isReskinned={ isReskinned }
								disableMonthlyExperiment={ false }
							/>
						</div>
					);
				} }
			</ProvideExperimentData>
		);
	}

	renderSignUpMonthlyPlansExperiment( errorDisplay ) {
		const {
			disableBloggerPlanWithNonBlogDomain,
			hideFreePlan,
			isLaunchPage,
			selectedSite,
			planTypes,
			flowName,
			showTreatmentPlansReorderTest,
			isInVerticalScrollingPlansExperiment,
			isReskinned,
		} = this.props;
		return (
			<ProvideExperimentData
				name="calypso_signup_monthly_plans_default_202201_v2"
				options={ {
					isEligible: [ 'onboarding', 'launch-site' ].includes( this.props.flowName ),
				} }
			>
				{ ( isLoading, experimentAssignment ) => {
					if ( isLoading ) {
						return this.renderLoading();
					}
					const isTreatmentMonthlyDefault = experimentAssignment?.variationName !== null;

					return (
						<div>
							{ errorDisplay }
							<PlansFeaturesMain
								site={ selectedSite || {} } // `PlanFeaturesMain` expects a default prop of `{}` if no site is provided
								hideFreePlan={ hideFreePlan }
								isInSignup={ true }
								isLaunchPage={ isLaunchPage }
								intervalType={ this.getIntervalType( isTreatmentMonthlyDefault ) }
								isBillingWordingExperiment={ false }
								onUpgradeClick={ this.onSelectPlan }
								showFAQ={ false }
								domainName={ this.getDomainName() }
								customerType={ this.getCustomerType() }
								disableBloggerPlanWithNonBlogDomain={ disableBloggerPlanWithNonBlogDomain }
								plansWithScroll={ this.state.isDesktop }
								planTypes={ planTypes }
								flowName={ flowName }
								showTreatmentPlansReorderTest={ showTreatmentPlansReorderTest }
								isAllPaidPlansShown={ true }
								isInVerticalScrollingPlansExperiment={ isInVerticalScrollingPlansExperiment }
								shouldShowPlansFeatureComparison={ this.state.isDesktop } // Show feature comparison layout in signup flow and desktop resolutions
								isReskinned={ isReskinned }
							/>
						</div>
					);
				} }
			</ProvideExperimentData>
		);
	}

	renderLoading() {
		return (
			<div className="plans__loading">
				<LoadingEllipsis active />
			</div>
		);
	}

	getHeaderText() {
		const { headerText, translate, eligibleForManagedPlan } = this.props;

		if ( eligibleForManagedPlan ) {
			return translate( 'Managed WordPress made just for you' );
		}

		if ( this.state.isDesktop ) {
			return translate( 'Choose a plan' );
		}

		return headerText || translate( "Pick a plan that's right for you." );
	}

	getSubHeaderText() {
		const { hideFreePlan, subHeaderText, translate, eligibleForManagedPlan } = this.props;

		if ( eligibleForManagedPlan ) {
			return translate( 'Try risk-free with a 14-day money back guarantee' );
		}

		if ( ! hideFreePlan ) {
			if ( this.state.isDesktop ) {
				return translate(
					"Pick one that's right for you and unlock features that help you grow. Or {{link}}start with a free site{{/link}}.",
					{
						components: {
							link: <Button onClick={ this.handleFreePlanButtonClick } borderless={ true } />,
						},
					}
				);
			}

			return translate( 'Choose a plan or {{link}}start with a free site{{/link}}.', {
				components: {
					link: <Button onClick={ this.handleFreePlanButtonClick } borderless={ true } />,
				},
			} );
		}

		if ( this.state.isDesktop ) {
			return translate( "Pick one that's right for you and unlock features that help you grow." );
		}

		return subHeaderText || translate( 'Choose a plan. Upgrade as you grow.' );
	}

	plansFeaturesSelection() {
		const {
			flowName,
			stepName,
			positionInFlow,
			translate,
			hasInitializedSitesBackUrl,
			steps,
		} = this.props;

		const headerText = this.getHeaderText();
		const fallbackHeaderText = this.props.fallbackHeaderText || headerText;
		const subHeaderText = this.getSubHeaderText();
		const fallbackSubHeaderText = this.props.fallbackSubHeaderText || subHeaderText;

		let backUrl;
		let backLabelText;

		if ( 0 === positionInFlow && hasInitializedSitesBackUrl ) {
			backUrl = hasInitializedSitesBackUrl;
			backLabelText = translate( 'Back to My Sites' );
		}

		let queryParams;
		if ( ! isNaN( Number( positionInFlow ) ) && 0 !== positionInFlow ) {
			const previousStepName = steps[ this.props.positionInFlow - 1 ];
			const previousStep = this.props.progress?.[ previousStepName ];

			const isComingFromUseYourDomainStep = 'use-your-domain' === previousStep?.stepSectionName;

			if ( isComingFromUseYourDomainStep ) {
				queryParams = {
					...this.props.queryParams,
					step: 'transfer-or-connect',
					initialQuery: previousStep?.siteUrl,
				};
			}
		}

		return (
			<>
				<StepWrapper
					flowName={ flowName }
					stepName={ stepName }
					positionInFlow={ positionInFlow }
					headerText={ headerText }
					fallbackHeaderText={ fallbackHeaderText }
					subHeaderText={ subHeaderText }
					fallbackSubHeaderText={ fallbackSubHeaderText }
					isWideLayout={ true }
					stepContent={ this.plansFeaturesList() }
					allowBackFirstStep={ !! hasInitializedSitesBackUrl }
					backUrl={ backUrl }
					backLabelText={ backLabelText }
					queryParams={ queryParams }
				/>
			</>
		);
	}

	render() {
		const classes = classNames( 'plans plans-step', {
			'in-vertically-scrolled-plans-experiment': this.props.isInVerticalScrollingPlansExperiment,
			'has-no-sidebar': true,
			'is-wide-layout': true,
		} );

		return (
			<>
				<QueryPlans />
				<MarketingMessage path="signup/plans" />
				<div className={ classes }>{ this.plansFeaturesSelection() }</div>
			</>
		);
	}
}

PlansStep.propTypes = {
	additionalStepData: PropTypes.object,
	disableBloggerPlanWithNonBlogDomain: PropTypes.bool,
	goToNextStep: PropTypes.func.isRequired,
	hideFreePlan: PropTypes.bool,
	selectedSite: PropTypes.object,
	stepName: PropTypes.string.isRequired,
	stepSectionName: PropTypes.string,
	customerType: PropTypes.string,
	translate: PropTypes.func.isRequired,
	planTypes: PropTypes.array,
	flowName: PropTypes.string,
	isTreatmentPlansReorderTest: PropTypes.bool,
};

/**
 * Checks if the domainItem picked in the domain step is a top level .blog domain -
 * we only want to make Blogger plan available if it is.
 *
 * @param {object} domainItem domainItem object stored in the "choose domain" step
 * @returns {boolean} is .blog domain registration
 */
export const isDotBlogDomainRegistration = ( domainItem ) => {
	if ( ! domainItem ) {
		return false;
	}
	const { is_domain_registration, meta } = domainItem;

	return is_domain_registration && getTld( meta ) === 'blog';
};

export default connect(
	(
		state,
		{ path, signupDependencies: { siteSlug, domainItem, plans_reorder_abtest_variation } }
	) => ( {
		// Blogger plan is only available if user chose either a free domain or a .blog domain registration
		disableBloggerPlanWithNonBlogDomain:
			domainItem && ! isSubdomain( domainItem.meta ) && ! isDotBlogDomainRegistration( domainItem ),
		// This step could be used to set up an existing site, in which case
		// some descendants of this component may display discounted prices if
		// they apply to the given site.
		selectedSite: siteSlug ? getSiteBySlug( state, siteSlug ) : null,
		customerType: parseQs( path.split( '?' ).pop() ).customerType,
		siteType: getSiteType( state ),
		hasInitializedSitesBackUrl: hasInitializedSites( state ) ? '/sites/' : false,
		showTreatmentPlansReorderTest:
			'treatment' === plans_reorder_abtest_variation || isTreatmentPlansReorderTest( state ),
		isLoadingExperiment: false,
		// IMPORTANT NOTE: The following is always set to true. It's a hack to resolve the bug reported
		// in https://github.com/Automattic/wp-calypso/issues/50896, till a proper cleanup and deploy of
		// treatment for the `vertical_plan_listing_v2` experiment is implemented.
		isInVerticalScrollingPlansExperiment: true,
		plansLoaded: Boolean( getPlanSlug( state, getPlan( PLAN_FREE )?.getProductId() || 0 ) ),
		eligibleForManagedPlan: isEligibleForManagedPlan( state, getSiteBySlug( state, siteSlug )?.ID ),
	} ),
	{ recordTracksEvent, saveSignupStep, submitSignupStep }
)( localize( PlansStep ) );
