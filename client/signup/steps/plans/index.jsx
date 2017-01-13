/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { isEmpty } from 'lodash';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import { cartItems } from 'lib/cart-values';
import SignupActions from 'lib/signup/actions';
import StepWrapper from 'signup/step-wrapper';
import PlansFeaturesMain from 'my-sites/plans-features-main';
import QueryPlans from 'components/data/query-plans';

class PlansStep extends Component {
	constructor( props ) {
		super( props );

		this.onSelectPlan = this.onSelectPlan.bind( this );
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

		SignupActions.submitSignupStep( {
			processingMessage: isEmpty( cartItem )
				? translate( 'Free plan selected' )
				: translate( 'Adding your plan' ),
			stepName,
			stepSectionName,
			cartItem,
			privacyItem,
			...additionalStepData
		}, [], { cartItem, privacyItem } );

		goToNextStep();
	}

	plansFeaturesList() {
		const {	hideFreePlan } = this.props;

		return (
			<div>
				<QueryPlans />

				<PlansFeaturesMain
					hideFreePlan={ hideFreePlan }
					isInSignup={ true }
					onUpgradeClick={ this.onSelectPlan }
					showFAQ={ false }
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

		const renderPlansFeatures = () => ( this.plansFeaturesSelection() );

		return <div className={ classes }>
			{ renderPlansFeatures() }
		</div>;
	}
}

PlansStep.propTypes = {
	additionalStepData: PropTypes.object,
	goToNextStep: PropTypes.func.isRequired,
	hideFreePlan: PropTypes.bool,
	stepName: PropTypes.string.isRequired,
	stepSectionName: PropTypes.string,
	translate: PropTypes.func.isRequired,
};

export default localize( PlansStep );
