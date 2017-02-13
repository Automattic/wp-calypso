/**
 * External dependencies
 */
import React, { Component } from 'react';
//import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import FormTextInput from 'components/forms/form-text-input';
import { localize } from 'i18n-calypso';

class Login extends Component {
	static defaultProps = {
		title: '',
		buttonText: '',
		legalText: ''
	};

	render() {
		const buttonText = this.props.buttonText || this.props.translate( 'Sign in' );
		return (
			<div className="login">
				<Card className="login__form">
					<div className="login__form-header">
						<div className="login__form-header-title">{ this.props.title }</div>
					</div>
					{ this.props.children }
					<div className="login__form-userdata">
						<label className="login__form-userdata-username">
							{ this.props.translate( 'Username or email' ) }
							<FormTextInput className="login__form-userdata-username-input" />
						</label>
						<label className="login__form-userdata-password">
							{ this.props.translate( 'Password' ) }
							<input className="login__form-userdata-password-input" type="password" />
						</label>
						<label className="login__form-userdata-stay-signed-in">
							<input className="login__form-userdata-stay-signed-in-check" type="checkbox" />
							{ this.props.translate( 'Stay signed in' ) }
						</label>
					</div>
				</Card>
				<Card className="login__form-action">
					<div className="login__form-action-legal">
						{ this.props.legalText }
					</div>
					<Button primary>{ buttonText }</Button>
				</Card>
			</div>
		);
	}
}

export default localize( Login );
