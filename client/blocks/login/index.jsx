/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import FormsButton from 'components/forms/form-button';
import FormPasswordInput from 'components/forms/form-password-input';
import Card from 'components/card';
import FormTextInput from 'components/forms/form-text-input';
import { loginUser } from 'state/login/actions';
import Notice from 'components/notice';
import postForm from 'lib/form/post';
import {
	isRequestingLogin,
	getError
} from 'state/login/selectors';

export class Login extends Component {
	static propTypes = {
		isRequestingLogin: PropTypes.bool.isRequired,
		loginUser: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		loginError: PropTypes.string,
		redirectLocation: PropTypes.string,
		title: PropTypes.string,
	};

	static defaultProps = {
		title: '',
	};

	constructor() {
		super();
		this.state = {
			usernameOrEmail: '',
			password: '',
		};
		this.onChangeField = this.onChangeField.bind( this );
		this.onSubmitForm = this.onSubmitForm.bind( this );
	}

	onChangeField( event ) {
		this.setState( {
			[ event.target.name ]: event.target.value
		} );
	}

	onSubmitForm( event ) {
		event.preventDefault();
		this.props.loginUser( this.state.usernameOrEmail, this.state.password ).then( () => {
			postForm( config( 'login_url' ), {
				log: this.state.usernameOrEmail,
				pwd: this.state.password,
				redirect_to: this.props.redirectLocation || window.location.origin,
				rememberme: 'forever',
			} );
		} );
	}

	renderNotices() {
		if ( this.props.loginError ) {
			return (
				<Notice status="is-error" text={ this.props.loginError } />
			);
		}
	}

	render() {
		const isDisabled = {};
		if ( this.props.isRequestingLogin ) {
			isDisabled.disabled = true;
		}

		return (
			<div className="login">

				{ this.renderNotices() }

				<div className="login__form-header">
					<div className="login__form-header-title">
						{ this.props.title }
					</div>
				</div>

				<form onSubmit={ this.onSubmitForm }>
					<Card className="login__form">
						<div className="login__form-userdata">
							<label className="login__form-userdata-username">
								{ this.props.translate( 'Username or Email Address' ) }
								<FormTextInput
									className="login__form-userdata-username-input"
									onChange={ this.onChangeField }
									name="usernameOrEmail"
									value={ this.state.usernameOrEmail }
									{ ...isDisabled } />
							</label>
							<label className="login__form-userdata-username">
								{ this.props.translate( 'Password' ) }
								<FormPasswordInput
									className="login__form-userdata-username-password"
									onChange={ this.onChangeField }
									name="password"
									value={ this.state.password }
									{ ...isDisabled } />
							</label>
						</div>
						<div className="login__form-remember-me">
							<label>
								<input type="checkbox" name="rememberme" />
								{ this.props.translate( 'Stay logged in' ) }
							</label>
						</div>
						<div className="login__form-action">
							<FormsButton primary { ...isDisabled }>
								{ this.props.translate( 'Log in' ) }
							</FormsButton>
						</div>
					</Card>
				</form>
			</div>
		);
	}
}

export default connect( state => {
	return {
		isRequestingLogin: isRequestingLogin( state ),
		loginError: getError( state )
	};
}, {
	loginUser
} )( localize( Login ) );
