/**
 * External dependencies
 */
import classNames from 'classnames';
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
import { loginUser } from 'state/login/actions';
import { recordTracksEvent } from 'state/analytics/actions';
import { isRequesting, getRequestError } from 'state/login/selectors';
import { errorNotice } from 'state/notices/actions';

export class LoginForm extends Component {
	static propTypes = {
		errorNotice: PropTypes.func.isRequired,
		isRequesting: PropTypes.bool.isRequired,
		loginError: PropTypes.string,
		loginUser: PropTypes.func.isRequired,
		onSuccess: PropTypes.func.isRequired,
		requestError: PropTypes.object,
		translate: PropTypes.func.isRequired,
	};

	state = {
		usernameOrEmail: '',
		password: '',
		rememberMe: false,
	};

	onChangeField = ( event ) => {
		this.setState( {
			[ event.target.name ]: event.target.value
		} );
	};

	onChangeRememberMe = ( event ) => {
		const { name, checked } = event.target;

		this.props.recordTracksEvent( 'calypso_login_block_remember_me_change', { new_value: checked } );

		this.setState( { [ name ]: checked } );
	};

	onSubmitForm = ( event ) => {
		event.preventDefault();

		this.props.recordTracksEvent( 'calypso_login_block_login_submit' );

		this.props.loginUser( this.state.usernameOrEmail, this.state.password, this.state.rememberMe ).then( () => {
			this.props.recordTracksEvent( 'calypso_login_block_login_success' );
			this.props.onSuccess( this.state );
		} ).catch( error => {
			this.props.recordTracksEvent( 'calypso_login_block_login_failure', {
				error_message: error.message
			} );

			if ( error.field === 'global' ) {
				if ( error.message === 'proxy_required' ) {
					// TODO: Remove once the proxy requirement is removed from the API

					let redirectTo = '';

					if ( typeof window !== 'undefined' && window.location.search.indexOf( '?redirect_to=' ) === 0 ) {
						redirectTo = window.location.search;
					}

					this.props.errorNotice(
						<p>
							{ 'This endpoint is restricted to proxied Automatticians for now. Please use ' }
							<a href={ config( 'login_url' ) + redirectTo }>the old login page</a>.
						</p>
					);
				} else {
					this.props.errorNotice( error.message );
				}
			}
		} );
	};

	render() {
		const isDisabled = {};
		if ( this.props.isRequesting ) {
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
							className={
								classNames( 'login__form-userdata-username-input', {
									'is-error': requestError && requestError.field === 'usernameOrEmail'
								} )
							}
							onChange={ this.onChangeField }
							id="usernameOrEmail"
							name="usernameOrEmail"
							value={ this.state.usernameOrEmail }
							{ ...isDisabled } />

						{ requestError && requestError.field === 'usernameOrEmail' && (
							<FormInputValidation isError text={ requestError.message } />
						) }

						<label htmlFor="password" className="login__form-userdata-username">
							{ this.props.translate( 'Password' ) }
						</label>

						<FormPasswordInput
							className={
								classNames( 'login__form-userdata-username-password', {
									'is-error': requestError && requestError.field === 'password'
								} )
							}
							onChange={ this.onChangeField }
							id="password"
							name="password"
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
							<span>{ this.props.translate( 'Stay logged in' ) }</span>
						</label>
					</div>

					<div className="login__form-action">
						<FormsButton primary { ...isDisabled }>
							{ this.props.translate( 'Log In' ) }
						</FormsButton>
					</div>
				</Card>
			</form>
		);
	}
}

export default connect(
	( state ) => ( {
		isRequesting: isRequesting( state ),
		requestError: getRequestError( state ),
	} ),
	{
		errorNotice,
		loginUser,
		recordTracksEvent,
	}
)( localize( LoginForm ) );
