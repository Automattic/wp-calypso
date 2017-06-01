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
import { errorNotice, infoNotice, removeNotice } from 'state/notices/actions';
import wpcom from 'lib/wp';
import WpcomLoginForm from 'signup/wpcom-login-form';

class SocialLoginForm extends Component {
	static propTypes = {
		errorNotice: PropTypes.func.isRequired,
		infoNotice: PropTypes.func.isRequired,
		removeNotice: PropTypes.func.isRequired,
		onSuccess: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	state = {
		username: null,
		bearerToken: null,
	};

	handleGoogleResponse = ( response ) => {
		if ( ! response.Zi || ! response.Zi.id_token ) {
			return;
		}

		this.props.loginSocialUser( 'google', response.Zi.id_token ).then( () => {
			this.props.onSuccess();
		} ).catch( error => {
			if ( error === 'unknown_user' ) {
				const { notice } = this.props.infoNotice( this.props.translate( 'Creating your account' ) );
				wpcom.undocumented().usersSocialNew( 'google', response.Zi.id_token, 'login', ( wpcomError, wpcomResponse ) => {
					this.props.removeNotice( notice.noticeId );
					if ( wpcomError ) {
						this.props.errorNotice( wpcomError.message );
					} else {
						this.setState( {
							username: wpcomResponse.username,
							bearerToken: wpcomResponse.bearer_token
						} );
					}
				} );
			} else {
				this.props.errorNotice( error );
			}
		} );
	};

	render() {
		return (
			<div className="login__social">
				<p className="login__social-text">
					{ this.props.translate( 'Or login with your existing social profile:' ) }
				</p>

				<div className="login__social-buttons">
					<GoogleLoginButton
						clientId={ config( 'google_oauth_client_id' ) }
						responseHandler={ this.handleGoogleResponse } />
				</div>

				{ this.state.bearerToken && (
					<WpcomLoginForm
						log={ this.state.username }
						authorization={ 'Bearer ' + this.state.bearerToken }
						redirectTo="/start"
					/>
				) }
			</div>
		);
	}
}

export default connect(
	null,
	{
		errorNotice,
		infoNotice,
		removeNotice,
		loginSocialUser,
	}
)( localize( SocialLoginForm ) );
