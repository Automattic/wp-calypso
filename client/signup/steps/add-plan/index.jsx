/** @format */
/**
 * External dependencies
 */
import { Component } from 'react';

/**
 * Internal dependencies
 */
import SignupActions from 'lib/signup/actions';
import { planItem } from 'lib/cart-values/cart-items';

class AddPlanComponent extends Component {
	componentDidMount() {
		const { stepName, stepSectionName, goToNextStep, planSlug } = this.props;

		const cartItem = planItem( planSlug );

		SignupActions.submitSignupStep(
			{
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
		return null;
	}
}

export default AddPlanComponent;
