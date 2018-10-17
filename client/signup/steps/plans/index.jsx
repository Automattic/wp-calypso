/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SignupActions from 'lib/signup/actions';
import StepWrapper from 'signup/step-wrapper';
import PlansFeaturesMain from 'my-sites/plans-features-main';
import QueryPlans from 'components/data/query-plans';

class PlansStep extends Component {
	componentDidMount() {
		SignupActions.saveSignupStep( {
			stepName: this.props.stepName,
		} );
	}

	onSelectPlan = cartItem => {
		event.preventDefault();
		const { goToNextStep, stepName, flowName, translate } = this.props;

		//Create site
		SignupActions.submitSignupStep(
			{
				processingMessage: translate( 'Collecting your information' ),
				stepName: stepName,
			},
			[],
			{
				plans: cartItem,
			}
		);

		goToNextStep( flowName );
	};

	handleFreePlanButtonClick = () => {
		this.onSelectPlan( null ); // onUpgradeClick expects a cart item -- null means Free Plan.
	};

	plansFeaturesList() {
		const { hideFreePlan } = this.props;

		return (
			<div>
				<QueryPlans />

				<PlansFeaturesMain
					site={ {} } // `PlanFeaturesMain` expects a default prop of `{}` if no site is provided
					hideFreePlan={ hideFreePlan }
					isInSignup={ true }
					onUpgradeClick={ this.onSelectPlan }
					showFAQ={ false }
					displayJetpackPlans={ false }
				/>
			</div>
		);
	}

	plansFeaturesSelection = () => {
		const { flowName, stepName, positionInFlow, signupProgress, translate } = this.props;

		const headerText = translate( "Pick a plan that's right for you." );

		return (
			<StepWrapper
				flowName={ flowName }
				stepName={ stepName }
				positionInFlow={ positionInFlow }
				headerText={ headerText }
				subHeaderText="Based on what you told us, we recommend the Premium plan."
				fallbackHeaderText={ headerText }
				signupProgress={ signupProgress }
				isWideLayout={ true }
				stepContent={ this.plansFeaturesList() }
			/>
		);
	};

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
	goToNextStep: PropTypes.func.isRequired,
	hideFreePlan: PropTypes.bool,
	selectedSite: PropTypes.object,
	stepName: PropTypes.string.isRequired,
	stepSectionName: PropTypes.string,
	translate: PropTypes.func.isRequired,
};

export default localize( PlansStep );
