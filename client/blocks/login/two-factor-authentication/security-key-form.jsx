/**
 * External dependencies
 */
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import FormButton from 'components/forms/form-button';
import { localize } from 'i18n-calypso';
import { recordTracksEventWithClientId as recordTracksEvent } from 'state/analytics/actions';
import { formUpdate, loginUserWithSecurityKey } from 'state/login/actions';
import TwoFactorActions from './two-factor-actions';
import Spinner from 'components/spinner';

/**
 * Style dependencies
 */
import './verification-code-form.scss';

class SecurityKeyForm extends Component {
	static propTypes = {
		formUpdate: PropTypes.func.isRequired,
		loginUserWithSecurityKey: PropTypes.func.isRequired,
		onSuccess: PropTypes.func.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
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
		const { translate } = this.props;

		return (
			<form onSubmit={ this.initiateSecurityKeyAuthentication }>
				<Card compact className="two-factor-authentication__verification-code-form">
					{ ! this.state.isAuthenticating && (
						<div>
							<p>
								{ translate( '{{strong}}Use your security key to finish logging in.{{/strong}}', {
									components: {
										strong: <strong />,
									},
								} ) }
							</p>
							<p>
								{ translate(
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

				<TwoFactorActions twoFactorAuthType={ 'webauthn' } />
			</form>
		);
	}
}

export default connect( null, {
	formUpdate,
	loginUserWithSecurityKey,
	recordTracksEvent,
} )( localize( SecurityKeyForm ) );
