/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import ReaderLandingStepContent from './content';

class ReaderLandingStep extends Component {
	handleButtonClick = () => {
		SignupActions.submitSignupStep( { stepName: this.props.stepName }, [], {} );
		this.props.goToNextStep();
	};

	render() {
		const { flowName, positionInFlow, signupProgress, stepName, translate } = this.props;

		return (
			<div className="reader-landing">
				<StepWrapper
					flowName={ flowName }
					stepName={ stepName }
					positionInFlow={ positionInFlow }
					headerText={ translate( 'Create an account and start using the Reader' ) }
					subHeaderText={ translate(
						'Use your existing email subscriptions in the WordPress.com Reader ' +
							'and keep updated on your favorite sites.'
					) }
					signupProgress={ signupProgress }
					stepContent={ <ReaderLandingStepContent onButtonClick={ this.handleButtonClick } /> }
				/>
			</div>
		);
	}
}

export default localize( ReaderLandingStep );
