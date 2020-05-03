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
import FormInputValidation from 'components/forms/form-input-validation';
import { localize } from 'i18n-calypso';
import Spinner from 'components/spinner';

/**
 * Style dependencies
 */
import './security-key-form.scss';

class SecurityKeyForm extends Component {
	static propTypes = {
		loginUserWithSecurityKey: PropTypes.func.isRequired,
		onComplete: PropTypes.func,

		translate: PropTypes.func.isRequired,
	};

	state = {
		isAuthenticating: false,
		showError: false,
	};

	initiateSecurityKeyAuthentication = ( event ) => {
		event.preventDefault();

		this.setState( { isAuthenticating: true, showError: false } );
		this.props
			.loginUserWithSecurityKey()
			.then( ( response ) => this.onComplete( null, response ) )
			.catch( ( error ) => {
				this.setState( { isAuthenticating: false, showError: true } );
				this.onComplete( error, null );
			} );
	};

	onComplete = ( error, data ) => {
		if ( this.props.onComplete ) {
			this.props.onComplete( error, data );
		}
	};

	render() {
		const { translate } = this.props;
		const { isAuthenticating } = this.state;

		return (
			<form onSubmit={ this.initiateSecurityKeyAuthentication }>
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
									'Insert your security key into your USB port. Then tap the button or gold disc.'
								) }
							</p>
						</div>
					) : (
						<div className="security-key-form__add-wait-for-key">
							<Spinner />
							<p className="security-key-form__add-wait-for-key-heading">
								{ translate( 'Waiting for security key' ) }
							</p>
							<p>{ translate( 'Connect and touch your security key to log in.' ) }</p>
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

export default connect( null, null )( localize( SecurityKeyForm ) );
