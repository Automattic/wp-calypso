/**
 * External dependencies
 */
import classNames from 'classnames';
import defer from 'lodash/defer';
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import FormsButton from 'components/forms/form-button';
import FormInputValidation from 'components/forms/form-input-validation';
import Card from 'components/card';
import FormPasswordInput from 'components/forms/form-password-input';
import FormTextInput from 'components/forms/form-text-input';
import FormCheckbox from 'components/forms/form-checkbox';
import { getCurrentQueryArguments } from 'state/ui/selectors';
import { loginUser, changeUsername } from 'state/login/actions';
import { recordTracksEvent } from 'state/analytics/actions';
import { getRequestError } from 'state/login/selectors';
import SocialLoginForm from './social';

export class LoginForm extends Component {
	static propTypes = {
		loginUser: PropTypes.func.isRequired,
		onSuccess: PropTypes.func.isRequired,
		redirectTo: PropTypes.string,
		requestError: PropTypes.object,
		translate: PropTypes.func.isRequired,
	};

	state = {
		isDisabled: true,
		usernameOrEmail: '',
		password: '',
		rememberMe: false,
	};

	componentDidMount() {
		this.setState( { isDisabled: false }, () => { // eslint-disable-line react/no-did-mount-set-state
			this.usernameOrEmail.focus();
		} );
	}

	componentDidUpdate( prevProps ) {
		const { requestError } = this.props;

		if ( prevProps.requestError || ! requestError ) {
			return;
		}

		if ( requestError.field === 'password' ) {
			defer( () => this.password.focus() );
		}

		if ( requestError.field === 'usernameOrEmail' ) {
			defer( () => this.usernameOrEmail.focus() );
		}
	}

	onChangeUsername = ( event ) => {
		this.props.changeUsername();
		this.onChangeField( event );
	};

	onChangeField = ( event ) => {
		this.setState( {
			[ event.target.name ]: event.target.value
		} );
	};

	onChangeRememberMe = ( event ) => {
		const { name, checked } = event.target;

		this.props.recordTracksEvent( 'calypso_login_block_remember_me_click', { new_value: checked } );

		this.setState( { [ name ]: checked } );
	};

	onSubmitForm = ( event ) => {
		event.preventDefault();

		const { password, rememberMe, usernameOrEmail } = this.state;
		const { onSuccess, redirectTo } = this.props;

		this.props.recordTracksEvent( 'calypso_login_block_login_form_submit' );

		this.setState( { isDisabled: true } );

		this.props.loginUser( usernameOrEmail, password, rememberMe, redirectTo ).then( () => {
			this.props.recordTracksEvent( 'calypso_login_block_login_form_success' );

			onSuccess();
		} ).catch( error => {
			this.setState( { isDisabled: false } );

			this.props.recordTracksEvent( 'calypso_login_block_login_form_failure', {
				error_code: error.code,
				error_message: error.message
			} );
		} );
	};

	savePasswordRef = ( input ) => {
		this.password = input;
	};

	saveUsernameOrEmailRef = ( input ) => {
		this.usernameOrEmail = input;
	};

	render() {
		const isDisabled = {};

		if ( this.state.isDisabled ) {
			isDisabled.disabled = true;
		}

		const { requestError } = this.props;

		return (
			<form onSubmit={ this.onSubmitForm } method="post">
				<Card className="login__form">
					<div className="login__form-userdata">
						<label htmlFor="usernameOrEmail" className="login__form-userdata-username">
							{ this.props.translate( 'Username or Email Address' ) }
						</label>

						<FormTextInput
							autoCapitalize="off"
							className={
								classNames( 'login__form-userdata-username-input', {
									'is-error': requestError && requestError.field === 'usernameOrEmail'
								} )
							}
							onChange={ this.onChangeUsername }
							id="usernameOrEmail"
							name="usernameOrEmail"
							ref={ this.saveUsernameOrEmailRef }
							value={ this.state.usernameOrEmail }
							{ ...isDisabled } />

						{ requestError && requestError.field === 'usernameOrEmail' && (
							<FormInputValidation isError text={ requestError.message } />
						) }

						<label htmlFor="password" className="login__form-userdata-username">
							{ this.props.translate( 'Password' ) }
						</label>

						<FormPasswordInput
							autoCapitalize="off"
							autoComplete="off"
							className={
								classNames( 'login__form-userdata-username-password', {
									'is-error': requestError && requestError.field === 'password'
								} )
							}
							onChange={ this.onChangeField }
							id="password"
							name="password"
							ref={ this.savePasswordRef }
							value={ this.state.password }
							{ ...isDisabled } />

						{ requestError && requestError.field === 'password' && (
							<FormInputValidation isError text={ requestError.message } />
						) }
					</div>

					<div className="login__form-remember-me">
						<label>
							<FormCheckbox
								name="rememberMe"
								checked={ this.state.rememberMe }
								onChange={ this.onChangeRememberMe }
								{ ...isDisabled } />
							<span>{ this.props.translate( 'Keep me logged in' ) }</span>
						</label>
					</div>

					<div className="login__form-action">
						<FormsButton primary { ...isDisabled }>
							{ this.props.translate( 'Log In' ) }
						</FormsButton>
					</div>
				</Card>
				{ config.isEnabled( 'signup/social' ) && (
					<Card>
						<div className="login__form-social">
							<SocialLoginForm onSuccess={ this.props.onSuccess } />
						</div>
					</Card>
				) }
			</form>
		);
	}
}

export default connect(
	( state ) => ( {
		redirectTo: getCurrentQueryArguments( state ).redirect_to,
		requestError: getRequestError( state ),
	} ),
	{
		changeUsername,
		loginUser,
		recordTracksEvent,
	}
)( localize( LoginForm ) );
