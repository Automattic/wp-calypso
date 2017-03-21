/**
 * External dependencies
 */
import React, { Component } from 'react';
import GoogleLoginButton from 'components/social-buttons/google';
import FacebookLoginButton from 'components/social-buttons/facebook';

/**
 * External dependencies
 */
import config from 'config';

class SocialSignupForm extends Component {
	constructor() {
		super();
		this.onGoogleResponse = this.onGoogleResponse.bind( this );
		this.onFacebookResponse = this.onFacebookResponse.bind( this );
	}

	onGoogleResponse( response ) {
		if ( ! response.Zi || ! response.Zi.id_token ) {
			return;
		}
		// TODO: post response to the new wpcom endpoint to login
	}

	onFacebookResponse( response ) {
		if ( ! response.email ) {
			return;
		}
		// TODO: post response to the new wpcom endpoint to login
	}

	render() {
		return (
			<div className="signup-form__social">
				<GoogleLoginButton
					clientId={ config( 'google_oauth_client_id' ) }
					responseHandler={ this.onGoogleResponse } />
				<FacebookLoginButton
					appId={ config( 'facebook_app_id' ) }
					responseHandler={ this.onFacebookResponse } />
			</div>
		);
	}
}

export default SocialSignupForm;
