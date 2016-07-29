/**
 * External dependencies
 */
import React, { Component } from 'react';
import { isEmpty } from 'lodash';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
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
			stepSectionName,
			stepName,
			goToNextStep,
			translate
		} = this.props;

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
			stepName: stepName,
			stepSectionName: stepSectionName,
			cartItem
		}, [], { cartItem } );

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
			signupProgressStore,
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
				signupProgressStore={ signupProgressStore }
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

export default localize( PlansStep );
