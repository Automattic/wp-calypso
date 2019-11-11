/** @format */

/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { submitSignupStep } from 'state/signup/progress/actions';

export class SubmitStepButton extends Component {
	handleSubmit = () => {
		this.props.submitSignupStep( { stepName: this.props.stepName } );
		this.props.goToNextStep();
	};

	render() {
		return (
			<Button primary className="submit-step-button" onClick={ this.handleSubmit }>
				{ this.props.buttonText }
			</Button>
		);
	}
}

export default connect(
	null,
	{ submitSignupStep }
)( SubmitStepButton );
