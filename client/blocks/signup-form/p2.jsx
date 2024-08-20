import { Button } from '@automattic/components';
import { localize } from 'i18n-calypso';
import { Component } from 'react';
import LoggedOutForm from 'calypso/components/logged-out-form';
import SocialSignupForm from './social';

import './p2.scss';
class P2SignupForm extends Component {
	state = {
		showEmailSignupForm: false,
	};

	showEmailSignupForm = () => this.setState( { showEmailSignupForm: true } );

	render() {
		const shouldShowEmailSignupForm =
			this.state.showEmailSignupForm || this.props?.error?.error === 'password_invalid';
		return (
			<div className="signup-form">
				{ shouldShowEmailSignupForm && (
					<LoggedOutForm onSubmit={ this.props.handleSubmit } noValidate>
						{ this.props.formFields }
						{ this.props.formFooter }
					</LoggedOutForm>
				) }

				{ shouldShowEmailSignupForm && (
					<div className="signup-form__p2-form-separator">{ this.props.translate( 'or' ) }</div>
				) }

				{ ! shouldShowEmailSignupForm && (
					<Button primary onClick={ this.showEmailSignupForm }>
						<span>{ this.props.translate( 'Continue with email' ) }</span>
					</Button>
				) }

				{ this.props.isSocialSignupEnabled && (
					<SocialSignupForm
						handleResponse={ this.props.handleSocialResponse }
						socialServiceResponse={ this.props.socialServiceResponse }
						compact
					/>
				) }

				{ this.props.footerLink }
			</div>
		);
	}
}

export default localize( P2SignupForm );
