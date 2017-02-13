/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
//import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import FormTextInput from 'components/forms/form-text-input';
import { localize } from 'i18n-calypso';
import { loginUser } from 'state/login/actions';

//const Login = ( { title, buttonText, legalText, translate, children } ) => {
class Login extends Component {
	static defaultProps = {
		title: '',
		buttonText: '',
		legalText: ''
	};

	state = {
		usernameOrEmail: '',
		password: '',
	};

	onChangeField = ( event ) => {
		this.setState( {
			[ event.target.name ]: event.target.value
		} );
	};

	onSubmitForm = ( event ) => {
		event.preventDefault();
		this.props.loginUser( this.state.usernameOrEmail, this.state.password );
	};

	render() {
		const buttonText = this.props.buttonText || this.props.translate( 'Sign in' );
		return (
			<div className="login">
				<form onSubmit={ this.onSubmitForm }>
					<Card className="login__form-userdata">
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
								/>
							</label>
							<label className="login__form-userdata-username">
								{ this.props.translate( 'Password' ) }
								<input
									className="login__form-userdata-username-password"
									onChange={ this.onChangeField }
									type="password"
									name="password"
									value={ this.state.password }
								/>
							</label>
						</div>
					</Card>
					<Card className="login__form-action">
						<div className="login__form-action-legal">
							{ this.props.legalText }
						</div>
						<input type="submit" value={ buttonText } />
					</Card>
				</form>
			</div>
		);
	}
}

export default connect( null, {
	loginUser
} )( localize( Login ) );
