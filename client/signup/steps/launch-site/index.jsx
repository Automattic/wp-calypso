/** @format */
/**
 * External dependencies
 */
import { Component } from 'react';

/**
 * Internal dependencies
 */
import SignupActions from 'lib/signup/actions';

class LaunchSiteComponent extends Component {
	componentDidMount() {
		const { flowName, stepName, goToNextStep } = this.props;

		SignupActions.submitSignupStep(
			{
				stepName,
			},
			[],
			{}
		);

		goToNextStep( flowName );
	}

	render() {
		return null;
	}
}

export default LaunchSiteComponent;
