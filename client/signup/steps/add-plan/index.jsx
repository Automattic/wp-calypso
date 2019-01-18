/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import QueryPlans from 'components/data/query-plans';
import SignupActions from 'lib/signup/actions';
import { planItem } from 'lib/cart-values/cart-items';

class AddPlanComponent extends Component {
	componentDidMount() {
		const { stepName, stepSectionName, goToNextStep } = this.props;

		const cartItem = planItem( 'business-bundle' );

		SignupActions.submitSignupStep(
			{
				processingMessage: 'Hey you!',
				stepName,
				stepSectionName,
				cartItem,
			},
			[],
			{
				cartItem,
			}
		);

		goToNextStep();
	}

	render() {
		return <QueryPlans />;
	}
}

export default AddPlanComponent;
