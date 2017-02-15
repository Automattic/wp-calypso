/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
//import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import FormsButton from 'components/forms/form-button';
import Card from 'components/card';
import FormTextInput from 'components/forms/form-text-input';
import { localize } from 'i18n-calypso';
import { loginUser, redirect } from 'state/login/actions';
import Notice from 'components/notice';

import {
	isRequestingLogin,
	isLoginSuccessful,
	getError
} from 'state/login/selectors';

export class LoginForm extends Component {
	static defaultProps = {
		title: '',
		buttonText: '',
		legalText: ''
	};

	state = {
		usernameOrEmail: '',
		password: '',
	};

	componentDidUpdate() {
		if ( this.props.isLoginSuccessful ) {
			this.props.redirect( this.props.redirectLocation || '/' );
		}
	}

	onChangeField = ( event ) => {
		this.setState( {
			[ event.target.name ]: event.target.value
		} );
	};

	onSubmitForm = ( event ) => {
		event.preventDefault();
		this.props.loginUser( this.state.usernameOrEmail, this.state.password );
	};

	renderNotices = () => {
		if ( this.props.loginError ) {
			return (
				<Notice status="is-error" text={ this.props.loginError } />
			);
		}
	}

	render() {
		const buttonText = this.props.buttonText || this.props.translate( 'Sign in' );
		const isDisabled = {};
		if ( this.props.isRequestingLogin ) {
			isDisabled.disabled = true;
		}

		return (
			<div className="login">

				{ this.renderNotices() }

				<form onSubmit={ this.onSubmitForm }>
					<Card className="login__form">
						<div className="login__form-header">
							<div className="login__form-header-title">{ this.props.title }</div>
						</div>
						{ this.props.children }
						<div className="login__form-userdata">
							<label className="login__form-userdata-username">
								{ this.props.translate( 'Username or email' ) }
								<FormTextInput
									className="login__form-userdata-username-input"
									onChange={ this.onChangeField }
									name="usernameOrEmail"
									value={ this.state.usernameOrEmail }
									{ ...isDisabled } />
							</label>
							<label className="login__form-userdata-username">
								{ this.props.translate( 'Password' ) }
								<input
									className="login__form-userdata-username-password"
									onChange={ this.onChangeField }
									type="password"
									name="password"
									value={ this.state.password }
									{ ...isDisabled } />
							</label>
						</div>
					</Card>
					<Card className="login__form-action">
						<div className="login__form-action-legal">
							{ this.props.legalText }
						</div>
						<FormsButton primary { ...isDisabled }>{ buttonText }</FormsButton>
					</Card>
				</form>
			</div>
		);
	}
}

export default connect( state => {
	return {
		isRequestingLogin: isRequestingLogin( state ),
		isLoginSuccessful: isLoginSuccessful( state ),
		loginError: getError( state )
	};
}, {
	loginUser,
	redirect
} )( localize( LoginForm ) );
