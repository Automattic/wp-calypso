/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import config from 'config';
import { createFormAndSubmit } from 'lib/form';
import LoginForm from './login-form';

class Login extends Component {
	static propTypes = {
		title: PropTypes.string,
		redirectLocation: PropTypes.string,
		twoFactorEnabled: PropTypes.bool,
	};

	handleValidUsernamePassword = ( { usernameOrEmail, password, rememberMe } ) => {
		if ( ! this.props.twoFactorEnabled ) {
			createFormAndSubmit( config( 'login_url' ), {
				log: usernameOrEmail,
				pwd: password,
				redirect_to: this.props.redirectLocation || window.location.origin,
				rememberme: rememberMe ? 1 : 0,
			} );
		}
	};

	handleValid2FACode = () => {
		// TODO: submit the form to /wp-login with the 2FA code
	};

	render() {
		const {
			title,
			twoFactorEnabled,
		} = this.props;

		if ( twoFactorEnabled ) {
			return (
				<div
					onSuccess={ this.handleValid2FACode } />
			);
		}

		return (
			<LoginForm
				title={ title }
				onSuccess={ this.handleValidUsernamePassword } />
		);
	}
}

export default connect(
	() => ( {
		twoFactorEnabled: false
	} ),
)( Login );
