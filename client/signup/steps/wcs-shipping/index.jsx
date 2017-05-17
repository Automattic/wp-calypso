/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
* Internal dependencies
*/
import Card from 'components/card';
import FormButton from 'components/forms/form-button';
import SignupActions from 'lib/signup/actions';

export default class WcsShippingComponent extends Component {
	handleSubmit = ( event ) => {
		event.preventDefault();

		SignupActions.submitSignupStep( {
			stepName: this.props.stepName
		} );

		this.props.goToNextStep();
	}

	render() {
		return (
			<Card>
				<form onSubmit={ this.handleSubmit }>
					<p>This is the step named { this.props.stepName }</p>
					<FormButton primary>
						Get started
					</FormButton>
				</form>
			</Card>
		);
	}
}
