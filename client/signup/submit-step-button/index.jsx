/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import SignupActions from 'lib/signup/actions';

module.exports = React.createClass( {
	displayName: 'SubmitStepButton',

	handleSubmit: function() {
		SignupActions.submitSignupStep( { stepName: this.props.stepName } );

		this.props.goToNextStep();
	},

	render: function() {
		return (
			<button onClick={ this.handleSubmit } className='button is-primary'>
				{ this.props.buttonText }
			</button>
		);
	}
} );
