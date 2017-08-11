/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import GoogleLoginButton from 'components/social-buttons/google';
import { localize } from 'i18n-calypso';
import { capitalize } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import { getCurrentQueryArguments } from 'state/ui/selectors';
import { loginSocialUser, createSocialUser, createSocialUserFailed } from 'state/login/actions';
import {
	getCreatedSocialAccountUsername,
	getCreatedSocialAccountBearerToken,
	isSocialAccountCreating,
} from 'state/login/selectors';
import { recordTracksEvent } from 'state/analytics/actions';
import WpcomLoginForm from 'signup/wpcom-login-form';
import { InfoNotice } from 'blocks/global-notice';

class SocialLoginForm extends Component {
	static propTypes = {
		createSocialUser: PropTypes.func.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		redirectTo: PropTypes.string,
		onSuccess: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		loginSocialUser: PropTypes.func.isRequired,
		linkingSocialService: PropTypes.string,
	};

	static defaultProps = {
		linkingSocialService: '',
	};

	handleGoogleResponse = ( response ) => {
		const { onSuccess, redirectTo } = this.props;

		if ( ! response.Zi || ! response.Zi.access_token || ! response.Zi.id_token ) {
			return;
		}

		const socialInfo = {
			service: 'google',
			access_token: response.Zi.access_token,
			id_token: response.Zi.id_token,
		};

		this.props.loginSocialUser( socialInfo, redirectTo )
			.then(
				() => {
					this.recordEvent( 'calypso_login_social_login_success' );

					onSuccess();
				},
				error => {
					if ( error.code === 'unknown_user' ) {
						return this.props.createSocialUser( socialInfo, 'login' )
							.then(
								() => this.recordEvent( 'calypso_login_social_signup_success' ),
								createAccountError => this.recordEvent( 'calypso_login_social_signup_failure', {
									error_code: createAccountError.code,
									error_message: createAccountError.message
								} )
							);
					} else if ( error.code === 'user_exists' ) {
						this.props.createSocialUserFailed( 'google', response.Zi.id_token, error );
					}

					this.recordEvent( 'calypso_login_social_login_failure', {
						error_code: error.code,
						error_message: error.message
					} );
				}
			);
	};

	recordEvent = ( eventName, params ) => this.props.recordTracksEvent( eventName, {
		social_account_type: 'google',
		...params
	} );

	trackGoogleLogin = () => {
		this.recordEvent( 'calypso_login_social_button_click' );
	};

	renderText() {
		if ( this.props.linkingSocialService ) {
			return (
				<p className="login__social-text">
					{ this.props.translate( 'Or, choose a different %(service)s account:', {
						args: {
							service: capitalize( this.props.linkingSocialService ),
						}
					} ) }
				</p>
			);
		}

		return (
			<p className="login__social-text">
				{ this.props.translate( 'Or log in with your existing social profile:' ) }
			</p>
		);
	}

	render() {
		return (
			<div className="login__social">
				{ this.renderText() }

				<div className="login__social-buttons">
					<GoogleLoginButton
						clientId={ config( 'google_oauth_client_id' ) }
						responseHandler={ this.handleGoogleResponse }
						onClick={ this.trackGoogleLogin } />
				</div>

				{ this.props.isSocialAccountCreating &&
					<InfoNotice text={ this.props.translate( 'Creating your account…' ) } />
				}

				{ this.props.bearerToken && (
					<WpcomLoginForm
						log={ this.props.username }
						authorization={ 'Bearer ' + this.props.bearerToken }
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
		isSocialAccountCreating: isSocialAccountCreating( state ),
		bearerToken: getCreatedSocialAccountBearerToken( state ),
		username: getCreatedSocialAccountUsername( state ),
	} ),
	{
		loginSocialUser,
		createSocialUser,
		createSocialUserFailed,
		recordTracksEvent,
	}
)( localize( SocialLoginForm ) );
