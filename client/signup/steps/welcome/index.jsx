/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';
import SignupActions from 'lib/signup/actions';
import wpcom from 'lib/wp';

module.exports = React.createClass( {
	getInitialState: function() {
		return {
			form: null,
			submitting: false
		};
	},

	handleSubmit: function( event ) {
		event.preventDefault();

		//Create site here

		SignupActions.submitSignupStep( {
			stepName: this.props.stepName,
		});

		this.props.goToNextStep();
	},

	renderContent: function() {
		return (
			<div className="welcome-content">
				<button className="button is-primary" onClick={ this.handleSubmit }>
					{ this.translate( 'Create your account' ) }
				</button>
			</div>
		)
	},

	render: function() {
		return (
			<StepWrapper
				flowName={ this.props.flowName }
				stepName={ this.props.stepName }
				positionInFlow={ this.props.positionInFlow }
				headerText={ this.translate( 'Welcome to WordPress.com' ) }
				subHeaderText={ this.translate( 'We\'ve partnered with Rebrand Cities to get businesses online. Get started today.' ) }
				signupProgress={ this.props.signupProgress }
				stepContent={ this.renderContent() } />
		);
	}
} );
