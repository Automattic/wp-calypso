/**
 * External dependencies
 */

import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { intersection } from 'lodash';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import { parse as parseQs } from 'qs';

/**
 * Internal dependencies
 */
import { getTld, isSubdomain } from 'lib/domains';
import { getSiteBySlug } from 'state/sites/selectors';
import StepWrapper from 'signup/step-wrapper';
import PlansFeaturesMain from 'my-sites/plans-features-main';
import GutenboardingHeader from 'my-sites/plans-features-main/gutenboarding-header';
import QueryPlans from 'components/data/query-plans';
import { FEATURE_UPLOAD_THEMES_PLUGINS } from '../../../lib/plans/constants';
import { planHasFeature } from '../../../lib/plans';
import { getSiteGoals } from 'state/signup/steps/site-goals/selectors';
import { getSiteType } from 'state/signup/steps/site-type/selectors';
import { getSiteTypePropertyValue } from 'lib/signup/site-type';
import { saveSignupStep, submitSignupStep } from 'state/signup/progress/actions';
import { recordTracksEvent } from 'state/analytics/actions';
import { abtest } from 'lib/abtest';

/**
 * Style dependencies
 */
import './style.scss';

export class PlansStep extends Component {
	componentDidMount() {
		this.props.saveSignupStep( { stepName: this.props.stepName } );
	}

	onSelectPlan = cartItem => {
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
			// dependencies used only for 'plans-with-domain' step in Gutenboarding pre-launch flow
			...( this.isGutenboarding() &&
				! this.props.isLaunchPage && {
					isPreLaunch: true,
					isGutenboardingCreate: true,
				} ),
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

		const siteGoals = this.props.siteGoals.split( ',' );
		const customerType =
			getSiteTypePropertyValue( 'slug', this.props.siteType, 'customerType' ) ||
			( intersection( siteGoals, [ 'sell', 'promote' ] ).length > 0 ? 'business' : 'personal' );

		return customerType;
	}

	handleFreePlanButtonClick = () => {
		this.onSelectPlan( null ); // onUpgradeClick expects a cart item -- null means Free Plan.
	};

	isGutenboarding = () =>
		this.props.flowName === 'frankenflow' || this.props.flowName === 'prelaunch'; // signup flows coming from Gutenboarding

	isEligibleForPlanStepTest() {
		return (
			! this.props.isLaunchPage &&
			! this.isGutenboarding() &&
			'variantCopyUpdates' === abtest( 'planStepCopyUpdates' )
		);
	}

	getGutenboardingHeader() {
		if ( this.isGutenboarding() ) {
			const { headerText, subHeaderText } = this.props;

			return (
				<GutenboardingHeader
					headerText={ headerText }
					subHeaderText={ subHeaderText }
					onFreePlanSelect={ this.handleFreePlanButtonClick }
				/>
			);
		}

		return null;
	}

	plansFeaturesList() {
		const {
			disableBloggerPlanWithNonBlogDomain,
			hideFreePlan,
			isLaunchPage,
			selectedSite,
			planTypes,
			flowName,
		} = this.props;

		return (
			<div>
				<QueryPlans />

				<PlansFeaturesMain
					site={ selectedSite || {} } // `PlanFeaturesMain` expects a default prop of `{}` if no site is provided
					hideFreePlan={ hideFreePlan }
					isInSignup={ true }
					isLaunchPage={ isLaunchPage }
					isEligibleForPlanStepTest={ this.isEligibleForPlanStepTest() }
					onUpgradeClick={ this.onSelectPlan }
					showFAQ={ false }
					displayJetpackPlans={ false }
					domainName={ this.getDomainName() }
					customerType={ this.getCustomerType() }
					disableBloggerPlanWithNonBlogDomain={ disableBloggerPlanWithNonBlogDomain }
					plansWithScroll={ true }
					planTypes={ planTypes }
					flowName={ flowName }
					customHeader={ this.getGutenboardingHeader() }
				/>
			</div>
		);
	}

	getHeaderTextAB() {
		if ( this.isEligibleForPlanStepTest() ) {
			return 'Select your WordPress.com plan';
		}

		return null;
	}

	getSubHeaderTextAB() {
		if ( this.isEligibleForPlanStepTest() ) {
			return 'All plans include blazing-fast WordPress hosting.';
		}

		return null;
	}

	plansFeaturesSelection() {
		const { flowName, stepName, positionInFlow, translate, selectedSite, siteSlug } = this.props;

		const headerText =
			this.getHeaderTextAB() ||
			this.props.headerText ||
			translate( "Pick a plan that's right for you." );
		const fallbackHeaderText = this.props.fallbackHeaderText || headerText;
		const subHeaderText =
			this.getSubHeaderTextAB() ||
			this.props.subHeaderText ||
			translate( 'Choose a plan. Upgrade as you grow.' );
		const fallbackSubHeaderText = this.props.fallbackSubHeaderText || subHeaderText;

		let backUrl, backLabelText;

		if ( 0 === positionInFlow && selectedSite ) {
			backUrl = '/view/' + siteSlug;
			backLabelText = translate( 'Back to Site' );
		}

		return (
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
				allowBackFirstStep={ !! selectedSite }
				backUrl={ backUrl }
				backLabelText={ backLabelText }
				hideFormattedHeader={ this.isGutenboarding() }
			/>
		);
	}

	render() {
		const classes = classNames( 'plans plans-step', {
			'has-no-sidebar': true,
			'is-wide-layout': true,
		} );

		return <div className={ classes }>{ this.plansFeaturesSelection() }</div>;
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
};

/**
 * Checks if the domainItem picked in the domain step is a top level .blog domain -
 * we only want to make Blogger plan available if it is.
 *
 * @param {object} domainItem domainItem object stored in the "choose domain" step
 * @returns {boolean} is .blog domain registration
 */
export const isDotBlogDomainRegistration = domainItem => {
	if ( ! domainItem ) {
		return false;
	}
	const { is_domain_registration, meta } = domainItem;

	return is_domain_registration && getTld( meta ) === 'blog';
};

export default connect(
	( state, { path, signupDependencies: { siteSlug, domainItem } } ) => ( {
		// Blogger plan is only available if user chose either a free domain or a .blog domain registration
		disableBloggerPlanWithNonBlogDomain:
			domainItem && ! isSubdomain( domainItem.meta ) && ! isDotBlogDomainRegistration( domainItem ),
		// This step could be used to set up an existing site, in which case
		// some descendants of this component may display discounted prices if
		// they apply to the given site.
		selectedSite: siteSlug ? getSiteBySlug( state, siteSlug ) : null,
		customerType: parseQs( path.split( '?' ).pop() ).customerType,
		siteGoals: getSiteGoals( state ) || '',
		siteType: getSiteType( state ),
		siteSlug,
	} ),
	{ recordTracksEvent, saveSignupStep, submitSignupStep }
)( localize( PlansStep ) );
