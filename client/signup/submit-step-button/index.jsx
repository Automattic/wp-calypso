/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import SignupActions from 'lib/signup/actions';

export default class SubmitStepButton extends Component {
	handleSubmit = () => {
		SignupActions.submitSignupStep( { stepName: this.props.stepName } );

		this.props.goToNextStep();
	};

	render() {
		return (
			<button onClick={ this.handleSubmit } className="submit-step-button button is-primary">
				{ this.props.buttonText }
			</button>
		);
	}
}
