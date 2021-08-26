import { Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';
import LoggedOutForm from 'calypso/components/logged-out-form';
import SocialSignupForm from './social';

import './p2.scss';
class P2SignupForm extends Component {
	state = {
		showEmailSignupForm: false,
	};

	showEmailSignupForm = () => this.setState( { showEmailSignupForm: true } );

	render() {
		return (
			<>
				{ this.state.showEmailSignupForm && (
					<LoggedOutForm onSubmit={ this.props.handleSubmit } noValidate={ true }>
						{ this.props.formFields }
						{ this.props.formFooter }
					</LoggedOutForm>
				) }

				{ ! this.state.showEmailSignupForm && (
					<Button
						primary
						className="signup-form__p2-show-email-signup-button"
						onClick={ this.showEmailSignupForm }
					>
						<span>{ this.props.translate( 'Continue with email' ) }</span>
					</Button>
				) }

				{ this.props.isSocialSignupEnabled && (
					<SocialSignupForm
						handleResponse={ this.props.handleSocialResponse }
						socialService={ this.props.socialService }
						socialServiceResponse={ this.props.socialServiceResponse }
						isReskinned={ this.props.isReskinned }
						compact={ true }
					/>
				) }
			</>
		);
	}
}

export default localize( P2SignupForm );
