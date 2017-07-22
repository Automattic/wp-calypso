/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import StepWrapper from 'signup/step-wrapper';


module.exports = React.createClass( {
	getInitialState: function() {
		return {
			form: null,
			submitting: false
		};
	},

	handleSubmit: function() {
		alert('take me to signup');
	},

	renderContent: function() {
		return (
			<div className="welcome-content">
				<button className="button is-primary" onClick={ this.handleSubmit }>Get started</button>
			</div>
		)
	},

	render: function() {
		return (
			<StepWrapper
				flowName={ this.props.flowName }
				stepName={ this.props.stepName }
				positionInFlow={ this.props.positionInFlow }
				headerText={ this.translate( 'Welcome to WordPress.com.' ) }
				subHeaderText={ this.translate( 'We\'ve partnered with REBRAND Cities to ....' ) }
				signupProgress={ this.props.signupProgress }
				stepContent={ this.renderContent() } />
		);
	}
} );
