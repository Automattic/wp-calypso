/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';
import isEmpty from 'lodash/isEmpty';

/**
 * Internal dependencies
 */
import PlansFeaturesMain from 'my-sites/plans-features-main';
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import QueryPlans from 'components/data/query-plans';

class PlansFeaturesStep extends Component {
	constructor( props ) {
		super( props );

		this.onUpgradeClick = this.onUpgradeClick.bind( this );
	}

	plansList() {
		const {	hideFreePlan } = this.props;

		return (
			<div>
				<QueryPlans />

				<PlansFeaturesMain
					hideFreePlan={ hideFreePlan }
					isInSignup={ true }
					onUpgradeClick={ this.onUpgradeClick } />
			</div>
		);
	}

	onUpgradeClick( cartItem ) {
		const {
			translate,
			stepName,
			stepSectionName,
			goToNextStep
		} = this.props;

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

	plansSelection() {
		const {
			translate,
			flowName,
			stepName,
			positionInFlow,
			signupProgressStore
		} = this.props;

		const headerText = translate( 'Pick a plan that\'s right for you.' );

		return (
			<StepWrapper
				flowName={ flowName }
				stepName={ stepName }
				positionInFlow={ positionInFlow }
				headerText={ headerText }
				fallbackHeaderText={ headerText }
				signupProgressStore={ signupProgressStore }
				stepContent={ this.plansList() } />
		);
	}

	render() {
		return (
			<div className="plans-features plans-features-step has-no-sidebar">
				{ this.plansSelection() }
			</div>
		);
	}
}

export default localize( PlansFeaturesStep );
