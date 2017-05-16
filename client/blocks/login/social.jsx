/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import GoogleLoginButton from 'components/social-buttons/google';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import { loginSocialUser } from 'state/login/actions';

class SocialLoginForm extends Component {
	static propTypes = {
		translate: PropTypes.func.isRequired,
	};

	constructor() {
		super();

		this.handleGoogleResponse = this.handleGoogleResponse.bind( this );
	}

	handleGoogleResponse( response ) {
		if ( ! response.Zi || ! response.Zi.id_token ) {
			return;
		}

		loginSocialUser( 'google', response.Zi.id_token );
	}

	render() {
		return (
			<div className="login__social">
				<p>
					{ this.props.translate( 'Or login with your existing social profile:' ) }
				</p>

				<div className="login__social-buttons">
					<GoogleLoginButton
						clientId={ config( 'google_oauth_client_id' ) }
						responseHandler={ this.handleGoogleResponse } />
				</div>
			</div>
		);
	}
}

export default localize( SocialLoginForm );
