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
					headerText={ translate( 'Keep track of all your favorite sites in one place' ) }
					subHeaderText={ translate(
						'Read posts from all the sites you follow, find great new reads, and stay up-to-date on comments and replies in one convenient place: the WordPress.com Reader.'
					) }
					signupProgress={ signupProgress }
					stepContent={ <ReaderLandingStepContent onButtonClick={ this.handleButtonClick } /> }
				/>
			</div>
		);
	}
}

export default localize( ReaderLandingStep );
