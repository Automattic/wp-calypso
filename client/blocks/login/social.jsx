/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import GoogleLoginButton from 'components/social-buttons/google';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import { loginSocialUser } from 'state/login/actions';
import { errorNotice } from 'state/notices/actions';

class SocialLoginForm extends Component {
	static propTypes = {
		errorNotice: PropTypes.func.isRequired,
		onSuccess: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	handleGoogleResponse = ( response ) => {
		if ( ! response.Zi || ! response.Zi.id_token ) {
			return;
		}

		this.props.loginSocialUser( 'google', response.Zi.id_token ).then( () => {
			this.props.onSuccess();
		} ).catch( error => {
			this.props.errorNotice( error );
		} );
	};

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

export default connect(
	null,
	{
		errorNotice,
		loginSocialUser,
	}
)( localize( SocialLoginForm ) );
