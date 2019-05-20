/** @format */

/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SubmitStepButton from 'signup/submit-step-button';

export default class TestStep extends React.Component {
	render() {
		return (
			<span>
				<StepWrapper
					flowName={ this.props.flowName }
					stepName={ this.props.stepName }
					positionInFlow={ this.props.positionInFlow }
					headerText="This is a test step"
					subHeaderText="Go ahead and click the button to continue. It'll blow your mind!"
					signupProgress={ this.props.signupProgress }
					goToNextStep={ this.props.goToNextStep }
				/>
				<SubmitStepButton
					buttonText="Click to continue"
					goToNextStep={ this.props.goToNextStep }
					stepName={ this.props.stepName }
				/>
			</span>
		);
	}
}
