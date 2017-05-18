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
import { isRequesting, getRequestError } from 'state/login/selectors';
import { errorNotice } from 'state/notices/actions';

class SocialLoginForm extends Component {
	static propTypes = {
		errorNotice: PropTypes.func.isRequired,
		isRequesting: PropTypes.bool.isRequired,
		onSuccess: PropTypes.func.isRequired,
		requestError: PropTypes.object,
		translate: PropTypes.func.isRequired,
	};


	handleGoogleResponse = ( response ) => {
		if ( ! response.Zi || ! response.Zi.id_token ) {
			return;
		}

		this.props.loginSocialUser( 'google', response.Zi.id_token ).then( () => {
			this.props.onSuccess();
		} ).catch( error => {
			if ( error.field === 'global' ) {
				this.props.errorNotice( error.message );
			}
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
	( state ) => ( {
		isRequesting: isRequesting( state ),
		requestError: getRequestError( state ),
	} ),
	{
		errorNotice,
		loginSocialUser,
	}
)( localize( SocialLoginForm ) );
