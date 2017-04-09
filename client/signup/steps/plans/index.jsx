/**
 * External dependencies
 */
import { connect } from 'react-redux';
import React, { Component, PropTypes } from 'react';
import { isEmpty } from 'lodash';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import { cartItems } from 'lib/cart-values';
import { getSiteBySlug } from 'state/sites/selectors';
import SignupActions from 'lib/signup/actions';
import StepWrapper from 'signup/step-wrapper';
import PlansFeaturesMain from 'my-sites/plans-features-main';
import QueryPlans from 'components/data/query-plans';

class PlansStep extends Component {
	constructor( props ) {
		super( props );

		this.onSelectPlan = this.onSelectPlan.bind( this );
		this.plansFeaturesSelection = this.plansFeaturesSelection.bind( this );
	}

	onSelectPlan( cartItem ) {
		const {
			additionalStepData,
			stepSectionName,
			stepName,
			goToNextStep,
			translate,
			signupDependencies: { domainItem }
		} = this.props,
			privacyItem = cartItem && domainItem && cartItems.domainPrivacyProtection( { domain: domainItem.meta } );

		if ( cartItem ) {
			analytics.tracks.recordEvent( 'calypso_signup_plan_select', {
				product_slug: cartItem.product_slug,
				free_trial: cartItem.free_trial,
				from_section: stepSectionName ? stepSectionName : 'default'
			} );
		} else {
			analytics.tracks.recordEvent( 'calypso_signup_free_plan_select', {
				from_section: stepSectionName ? stepSectionName : 'default'
			} );
		}

		const step = {
			processingMessage: isEmpty( cartItem )
				? translate( 'Free plan selected' )
				: translate( 'Adding your plan' ),
			stepName,
			stepSectionName,
			cartItem,
			privacyItem,
			...additionalStepData
		};

		const providedDependencies = { cartItem, privacyItem };

		SignupActions.submitSignupStep( step, [], providedDependencies );

		goToNextStep();
	}

	plansFeaturesList() {
		const {	hideFreePlan, selectedSite } = this.props;

		return (
			<div>
				<QueryPlans />

				<PlansFeaturesMain
					site={ selectedSite || {} } // `PlanFeaturesMain` expects a default prop of `{}` if no site is provided
					hideFreePlan={ hideFreePlan }
					isInSignup={ true }
					onUpgradeClick={ this.onSelectPlan }
					showFAQ={ false }
					displayJetpackPlans={ false }
				/>
			</div>
		);
	}

	plansFeaturesSelection() {
		const {
			flowName,
			stepName,
			positionInFlow,
			signupProgress,
			translate
		} = this.props;

		const headerText = translate( "Pick a plan that's right for you." );

		return (
			<StepWrapper
				flowName={ flowName }
				stepName={ stepName }
				positionInFlow={ positionInFlow }
				headerText={ headerText }
				fallbackHeaderText={ headerText }
				signupProgress={ signupProgress }
				isWideLayout={ true }
				stepContent={ this.plansFeaturesList() } />
		);
	}

	render() {
		const classes = classNames( 'plans plans-step', {
			'has-no-sidebar': true,
			'is-wide-layout': true
		} );

		return <div className={ classes }>
			{ this.plansFeaturesSelection() }
		</div>;
	}
}

PlansStep.propTypes = {
	additionalStepData: PropTypes.object,
	goToNextStep: PropTypes.func.isRequired,
	hideFreePlan: PropTypes.bool,
	selectedSite: PropTypes.object,
	stepName: PropTypes.string.isRequired,
	stepSectionName: PropTypes.string,
	translate: PropTypes.func.isRequired,
};

export default connect(
	( state, { signupDependencies: { siteSlug } } ) => ( {
		// This step could be used to set up an existing site, in which case
		// some descendants of this component may display discounted prices if
		// they apply to the given site.
		selectedSite: siteSlug ? getSiteBySlug( state, siteSlug ) : null
	} )
)( localize( PlansStep ) );
