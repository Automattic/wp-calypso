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
import { getCurrentQueryArguments } from 'state/ui/selectors';
import { loginSocialUser } from 'state/login/actions';
import { errorNotice, infoNotice, removeNotice } from 'state/notices/actions';
import { recordTracksEvent } from 'state/analytics/actions';
import wpcom from 'lib/wp';
import WpcomLoginForm from 'signup/wpcom-login-form';

class SocialLoginForm extends Component {
	static propTypes = {
		errorNotice: PropTypes.func.isRequired,
		infoNotice: PropTypes.func.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		redirectTo: PropTypes.string,
		removeNotice: PropTypes.func.isRequired,
		onSuccess: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	state = {
		username: null,
		bearerToken: null,
	};

	handleGoogleResponse = ( response ) => {
		const { onSuccess, redirectTo, translate } = this.props;

		if ( ! response.Zi || ! response.Zi.id_token ) {
			return;
		}

		this.props.loginSocialUser( 'google', response.Zi.id_token, redirectTo ).then( () => {
			this.props.recordTracksEvent( 'calypso_social_login_form_login_success', {
				social_account_type: 'google',
			} );

			onSuccess();
		} ).catch( error => {
			if ( error.code === 'unknown_user' ) {
				const { notice } = this.props.infoNotice( translate( 'Creating your account' ) );

				wpcom.undocumented().usersSocialNew( 'google', response.Zi.id_token, 'login', ( wpcomError, wpcomResponse ) => {
					this.props.removeNotice( notice.noticeId );

					if ( wpcomError ) {
						this.props.recordTracksEvent( 'calypso_social_login_form_signup_failure', {
							social_account_type: 'google',
							error: wpcomError.message
						} );

						this.props.errorNotice( wpcomError.message );
					} else {
						this.props.recordTracksEvent( 'calypso_social_login_form_signup_success', {
							social_account_type: 'google',
						} );

						this.setState( {
							username: wpcomResponse.username,
							bearerToken: wpcomResponse.bearer_token
						} );
					}
				} );
			} else {
				this.props.recordTracksEvent( 'calypso_social_login_form_login_failure', {
					social_account_type: 'google',
					error: error.message
				} );

				this.props.errorNotice( error.message );
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
	( state ) => ( {
		redirectTo: getCurrentQueryArguments( state ).redirect_to,
	} ),
	{
		errorNotice,
		infoNotice,
		removeNotice,
		loginSocialUser,
		recordTracksEvent,
	}
)( localize( SocialLoginForm ) );
