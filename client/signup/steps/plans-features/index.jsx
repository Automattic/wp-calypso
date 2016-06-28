/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PlanFeaturesMain from 'my-sites/plan-features-main';
import StepWrapper from 'signup/step-wrapper';

class PlansFeaturesStep extends Component {
	plansList() {
		const {	plans, hideFreePlan } = this.props;

		return (
			<div>
				<PlanFeaturesMain
					plans={ plans }
					hideFreePlan={ hideFreePlan }
					isInSignup={ true }
					onSelectPlan={ this.onSelectPlan } />
			</div>
		);
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
}

export default localize( PlansFeaturesStep );
