/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import GoogleLoginButton from 'components/social-buttons/google';
import FacebookLoginButton from 'components/social-buttons/facebook';
import { localize } from 'i18n-calypso';

/**
 * External dependencies
 */
import config from 'config';

class SocialSignupForm extends Component {
	static propTypes = {
		handleResponse: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	constructor() {
		super();

		this.handleGoogleResponse = this.handleGoogleResponse.bind( this );
		this.handleFacebookResponse = this.handleFacebookResponse.bind( this );
	}

	handleGoogleResponse( response ) {
		if ( ! response.Zi || ! response.Zi.id_token ) {
			return;
		}

		this.props.handleResponse( 'google', response.Zi.id_token );
	}

	handleFacebookResponse( response ) {
		if ( ! response.email ) {
			return;
		}
		// TODO: post response to the new wpcom endpoint to login
	}

	render() {
		return (
			<div className="signup-form__social">
				<p>
					{ this.props.translate( 'Or create account using social profile:' ) }
				</p>

				<div className="signup-form__social-buttons">
					<GoogleLoginButton
						clientId={ config( 'google_oauth_client_id' ) }
						responseHandler={ this.handleGoogleResponse } />

					<FacebookLoginButton
						appId={ config( 'facebook_app_id' ) }
						responseHandler={ this.handleFacebookResponse } />
				</div>

				<p>
					{ this.props.translate(
						"Connect to your existing social profile to get started faster. We'll never post without your permission."
					) }
				</p>
			</div>
		);
	}
}

export default localize( SocialSignupForm );
