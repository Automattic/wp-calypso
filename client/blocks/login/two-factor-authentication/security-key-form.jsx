import { Card, Spinner } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import FormButton from 'calypso/components/forms/form-button';
import { recordTracksEventWithClientId as recordTracksEvent } from 'calypso/state/analytics/actions';
import { formUpdate, loginUserWithSecurityKey } from 'calypso/state/login/actions';
import TwoFactorActions from './two-factor-actions';
import './verification-code-form.scss';

class SecurityKeyForm extends Component {
	static propTypes = {
		formUpdate: PropTypes.func.isRequired,
		loginUserWithSecurityKey: PropTypes.func.isRequired,
		onSuccess: PropTypes.func.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		switchTwoFactorAuthType: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		showOrDivider: PropTypes.bool,
		isWoo: PropTypes.bool,
	};

	static defaultProps = {
		isWoo: false,
	};

	state = {
		isAuthenticating: false,
	};

	initiateSecurityKeyAuthentication = ( event ) => {
		event.preventDefault();

		const { onSuccess } = this.props;
		this.setState( { isAuthenticating: true } );
		this.props
			.loginUserWithSecurityKey()
			.then( () => onSuccess() )
			.catch( () => this.setState( { isAuthenticating: false } ) );
	};

	render() {
		const { translate, isWoo, switchTwoFactorAuthType } = this.props;

		return (
			<form
				className="two-factor-authentication__verification-code-form-wrapper"
				onSubmit={ this.initiateSecurityKeyAuthentication }
			>
				<Card compact className="two-factor-authentication__verification-code-form">
					{ ! this.state.isAuthenticating && (
						<div className="security-key-form__help-text">
							<p>
								{ translate( '{{strong}}Use your security key to finish logging in.{{/strong}}', {
									components: {
										strong: <strong />,
									},
								} ) }
							</p>
							<p>
								{ isWoo
									? translate(
											'Insert your security key into your USB port, then tap the button or gold disc.'
									  )
									: translate(
											'Insert your security key into your USB port. Then tap the button or gold disc.'
									  ) }
							</p>
						</div>
					) }
					{ this.state.isAuthenticating && (
						<div className="security-key-form__add-wait-for-key">
							<Spinner />
							<p className="security-key-form__add-wait-for-key-heading">
								{ translate( 'Waiting for security key' ) }
							</p>
							<p>{ translate( 'Connect and touch your security key to log in.' ) }</p>
						</div>
					) }
					<FormButton
						autoFocus // eslint-disable-line jsx-a11y/no-autofocus
						primary
						disabled={ this.state.isAuthenticating }
					>
						{ translate( 'Continue with security key' ) }
					</FormButton>
				</Card>

				<TwoFactorActions
					twoFactorAuthType="webauthn"
					switchTwoFactorAuthType={ switchTwoFactorAuthType }
				/>
			</form>
		);
	}
}

export default connect( null, {
	formUpdate,
	loginUserWithSecurityKey,
	recordTracksEvent,
} )( localize( SecurityKeyForm ) );
