import { Card, FormInputValidation, Spinner } from '@automattic/components';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import FormButton from 'calypso/components/forms/form-button';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';

import './security-key-form.scss';

export class SecurityKeyForm extends Component {
	static propTypes = {
		twoStepAuthorization: PropTypes.object.isRequired,
		translate: PropTypes.func.isRequired,
	};

	state = {
		isAuthenticating: false,
		showError: false,
	};

	componentDidMount() {
		this.initiateSecurityKeyAuthentication();
	}

	initiateSecurityKeyAuthentication = ( retryRequest = true ) => {
		this.setState( { isAuthenticating: true, showError: false } );

		this.props.twoStepAuthorization
			.loginUserWithSecurityKey( { user_id: this.props.currentUserId } )
			.catch( ( error ) => {
				const errors = error?.data?.errors ?? [];
				if ( errors.some( ( e ) => e.code === 'invalid_two_step_nonce' ) ) {
					this.props.twoStepAuthorization.fetch( () => {
						if ( retryRequest ) {
							this.initiateSecurityKeyAuthentication( false );
						} else {
							// We only retry once, so let's show the original error.
							this.setState( { isAuthenticating: false, showError: true } );
						}
					} );
					return;
				}
				this.setState( { isAuthenticating: false, showError: true } );
			} );
	};

	render() {
		const { translate } = this.props;
		const { isAuthenticating } = this.state;

		return (
			<form
				onSubmit={ ( event ) => {
					event.preventDefault();
					this.initiateSecurityKeyAuthentication();
				} }
			>
				<Card compact className="security-key-form__verification-code-form">
					{ ! isAuthenticating ? (
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
									'Insert your hardware security key, or follow the instructions in your browser or phone to log in.'
								) }
							</p>
						</div>
					) : (
						<div className="security-key-form__add-wait-for-key">
							<Spinner />
							<p className="security-key-form__add-wait-for-key-heading">
								{ translate( 'Waiting for security key' ) }
							</p>
							<p>
								{ translate(
									'Connect and touch your security key to log in, or follow the directions in your browser or pop-up.'
								) }
							</p>
						</div>
					) }
					{ this.state.showError && (
						<FormInputValidation
							isError
							text={ this.props.translate(
								'An error occurred, please try again or use an alternate authentication method.'
							) }
						/>
					) }
					<FormButton
						autoFocus // eslint-disable-line jsx-a11y/no-autofocus
						primary
						disabled={ isAuthenticating }
					>
						{ translate( 'Continue with security key' ) }
					</FormButton>
				</Card>
			</form>
		);
	}
}

export default connect( ( state ) => ( {
	currentUserId: getCurrentUserId( state ),
} ) )( localize( SecurityKeyForm ) );
