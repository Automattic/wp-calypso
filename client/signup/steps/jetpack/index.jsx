/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import EmailSignupForm from 'signup/steps/email-signup-form';

module.exports = React.createClass( {
	displayName: 'Jetpack User Signup',

	render: function() {
		this.props.signupDependencies.jetpackRedirect = this.props.jetpackRedirect;

		return (
			<EmailSignupForm { ...this.props }
				headerText={ this.translate( 'Create an account for Jetpack' ) }
				subHeaderText={ this.translate( 'You\'re moments away from connecting Jetpack.' ) } />
		);
	}
} );
