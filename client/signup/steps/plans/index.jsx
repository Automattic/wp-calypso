/** @format */

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
import analytics from 'lib/analytics';
import { getTld, isSubdomain } from 'lib/domains';
import isDomainOnlySite from 'state/selectors/is-domain-only-site';
import { getSiteBySlug } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import StepWrapper from 'signup/step-wrapper';
import PlansFeaturesMain from 'my-sites/plans-features-main';
import PlansSkipButton from 'components/plans/plans-skip-button';
import QueryPlans from 'components/data/query-plans';
import { FEATURE_UPLOAD_THEMES_PLUGINS } from '../../../lib/plans/constants';
import { planHasFeature } from '../../../lib/plans';
import { getSiteGoals } from 'state/signup/steps/site-goals/selectors';
import { getSiteType } from 'state/signup/steps/site-type/selectors';
import { getSiteTypePropertyValue } from 'lib/signup/site-type';
import { saveSignupStep, submitSignupStep } from 'state/signup/progress/actions';

/**
 * Style dependencies
 */
import './style.scss';

export class PlansStep extends Component {
	componentDidMount() {
		if (
			typeof window !== 'undefined' &&
			window.location &&
			typeof document !== 'undefined' &&
			document.createElement &&
			document.body
		) {
			if ( window.location.search ) {
				// save this so that we can enter debug mode in the widget
				window.salesteam_initial_search_string = window.location.search;
			}

			const salesTeamStyles = document.createElement( 'link' );
			salesTeamStyles.setAttribute(
				'href',
				'//s0.wp.com/wp-content/a8c-plugins/wpcom-salesteam/css/wpcom-salesteam.css?ver=1'
			);
			salesTeamStyles.setAttribute( 'rel', 'stylesheet' );
			salesTeamStyles.setAttribute( 'type', 'text/css' );
			salesTeamStyles.setAttribute( 'media', 'all' );
			document.head.appendChild( salesTeamStyles );

			const salesTeamScript = document.createElement( 'script' );
			salesTeamScript.setAttribute(
				'src',
				'//s0.wp.com/wp-content/a8c-plugins/wpcom-salesteam/js/wpcom-salesteam.js?ver=20190418'
			);
			salesTeamScript.setAttribute( 'defer', true );
			document.head.appendChild( salesTeamScript );
		}

		this.props.saveSignupStep( { stepName: this.props.stepName } );
	}

	onSelectPlan = cartItem => {
		const { additionalStepData, stepSectionName, stepName, flowName, goToNextStep } = this.props;

		if ( cartItem ) {
			analytics.tracks.recordEvent( 'calypso_signup_plan_select', {
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
			analytics.tracks.recordEvent( 'calypso_signup_free_plan_select', {
				from_section: stepSectionName ? stepSectionName : 'default',
			} );
		}

		const step = {
			stepName,
			stepSectionName,
			cartItem,
			...additionalStepData,
		};

		const providedDependencies = { cartItem };

		this.props.submitSignupStep( step, providedDependencies );

		goToNextStep();
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
		let customerType =
			getSiteTypePropertyValue( 'slug', this.props.siteType, 'customerType' ) ||
			( intersection( siteGoals, [ 'sell', 'promote' ] ).length > 0 ? 'business' : 'personal' );

		// Default to 'business' when the blogger plan is not available.
		if ( customerType === 'personal' && this.props.disableBloggerPlanWithNonBlogDomain ) {
			customerType = 'business';
		}

		return customerType;
	}

	handleFreePlanButtonClick = () => {
		this.onSelectPlan( null ); // onUpgradeClick expects a cart item -- null means Free Plan.
	};

	plansFeaturesList() {
		const {
			disableBloggerPlanWithNonBlogDomain,
			hideFreePlan,
			isDomainOnly,
			isLaunchPage,
			selectedSite,
		} = this.props;

		return (
			<div>
				<QueryPlans />

				<PlansFeaturesMain
					site={ selectedSite || {} } // `PlanFeaturesMain` expects a default prop of `{}` if no site is provided
					hideFreePlan={ hideFreePlan }
					isInSignup={ true }
					isLaunchPage={ isLaunchPage }
					onUpgradeClick={ this.onSelectPlan }
					showFAQ={ false }
					displayJetpackPlans={ false }
					domainName={ this.getDomainName() }
					customerType={ this.getCustomerType() }
					disableBloggerPlanWithNonBlogDomain={ disableBloggerPlanWithNonBlogDomain }
					plansWithScroll={ true }
				/>
				{ /* The `hideFreePlan` means that we want to hide the Free Plan Info Column.
				 * In most cases, we want to show the 'Start with Free' PlansSkipButton instead --
				 * unless we've already selected an option that implies a paid plan.
				 * This is in particular true for domain names. */
				hideFreePlan && ! isDomainOnly && ! this.getDomainName() && (
					<PlansSkipButton onClick={ this.handleFreePlanButtonClick } />
				) }
			</div>
		);
	}

	plansFeaturesSelection() {
		const {
			flowName,
			stepName,
			positionInFlow,
			signupProgress,
			translate,
			selectedSite,
			siteSlug,
		} = this.props;

		let headerText = this.props.headerText || translate( "Pick a plan that's right for you." );

		//Temporary header for onboarding-dev flow
		if ( 'onboarding-dev' === flowName ) {
			headerText = translate( 'Pick your plan' );
		}

		const fallbackHeaderText = this.props.fallbackHeaderText || headerText;
		const subHeaderText = this.props.subHeaderText;
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
				signupProgress={ signupProgress }
				isWideLayout={ true }
				stepContent={ this.plansFeaturesList() }
				allowBackFirstStep={ !! selectedSite }
				backUrl={ backUrl }
				backLabelText={ backLabelText }
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
};

/**
 * Checks if the domainItem picked in the domain step is a top level .blog domain -
 * we only want to make Blogger plan available if it is.
 *
 * @param {Object} domainItem domainItem object stored in the "choose domain" step
 * @return {bool} is .blog domain registration
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
		isDomainOnly: isDomainOnlySite( state, getSelectedSiteId( state ) ),
		selectedSite: siteSlug ? getSiteBySlug( state, siteSlug ) : null,
		customerType: parseQs( path.split( '?' ).pop() ).customerType,
		siteGoals: getSiteGoals( state ) || '',
		siteType: getSiteType( state ),
		siteSlug,
	} ),
	{ saveSignupStep, submitSignupStep }
)( localize( PlansStep ) );
