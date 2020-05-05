/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import AppleLoginButton from 'components/social-buttons/apple';
import GoogleLoginButton from 'components/social-buttons/google';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import config from 'config';
import { Card } from '@automattic/components';
import { loginSocialUser, createSocialUser, createSocialUserFailed } from 'state/login/actions';
import {
	getCreatedSocialAccountUsername,
	getCreatedSocialAccountBearerToken,
	getRedirectToOriginal,
	isSocialAccountCreating,
} from 'state/login/selectors';
import { recordTracksEventWithClientId as recordTracksEvent } from 'state/analytics/actions';
import WpcomLoginForm from 'signup/wpcom-login-form';
import { InfoNotice } from 'blocks/global-notice';
import { localizeUrl } from 'lib/i18n-utils';
import { login } from 'lib/paths';

/**
 * Style dependencies
 */
import './social.scss';

class SocialLoginForm extends Component {
	static propTypes = {
		createSocialUser: PropTypes.func.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		redirectTo: PropTypes.string,
		onSuccess: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		loginSocialUser: PropTypes.func.isRequired,
		uxMode: PropTypes.string.isRequired,
		linkingSocialService: PropTypes.string,
		socialService: PropTypes.string,
		socialServiceResponse: PropTypes.object,
	};

	static defaultProps = {
		linkingSocialService: '',
	};

	handleGoogleResponse = ( response, triggeredByUser = true ) => {
		const { onSuccess, socialService } = this.props;
		let redirectTo = this.props.redirectTo;

		if ( ! response.getAuthResponse ) {
			return;
		}

		const tokens = response.getAuthResponse();

		if ( ! tokens || ! tokens.access_token || ! tokens.id_token ) {
			return;
		}

		// ignore response if the user did not click on the google button
		// and did not follow the redirect flow
		if ( ! triggeredByUser && socialService !== 'google' ) {
			return;
		}

		// load persisted redirect_to url from session storage, needed for redirect_to to work with google redirect flow
		if ( ! triggeredByUser && ! redirectTo ) {
			redirectTo = window.sessionStorage.getItem( 'login_redirect_to' );
		}

		window.sessionStorage.removeItem( 'login_redirect_to' );

		const socialInfo = {
			service: 'google',
			access_token: tokens.access_token,
			id_token: tokens.id_token,
		};

		this.props.loginSocialUser( socialInfo, redirectTo ).then(
			() => {
				this.recordEvent( 'calypso_login_social_login_success', 'google' );

				onSuccess();
			},
			( error ) => {
				if ( error.code === 'unknown_user' ) {
					return this.props.createSocialUser( socialInfo, 'login' ).then(
						() => this.recordEvent( 'calypso_login_social_signup_success', 'google' ),
						( createAccountError ) =>
							this.recordEvent( 'calypso_login_social_signup_failure', 'google', {
								error_code: createAccountError.code,
								error_message: createAccountError.message,
							} )
					);
				} else if ( error.code === 'user_exists' ) {
					this.props.createSocialUserFailed( socialInfo, error );
				}

				this.recordEvent( 'calypso_login_social_login_failure', 'google', {
					error_code: error.code,
					error_message: error.message,
				} );
			}
		);
	};

	handleAppleResponse = ( response ) => {
		const { onSuccess, socialService } = this.props;
		let redirectTo = this.props.redirectTo;

		if ( ! response.id_token ) {
			return;
		}

		// load persisted redirect_to url from session storage, needed for redirect_to to work with apple redirect flow
		if ( socialService === 'apple' && ! redirectTo ) {
			redirectTo = window.sessionStorage.getItem( 'login_redirect_to' );
		}

		window.sessionStorage.removeItem( 'login_redirect_to' );

		const user = response.user || {};

		const socialInfo = {
			service: 'apple',
			id_token: response.id_token,
			user_name: user.name,
			user_email: user.email,
		};

		this.props.loginSocialUser( socialInfo, redirectTo ).then(
			() => {
				this.recordEvent( 'calypso_login_social_login_success', 'apple' );

				onSuccess();
			},
			( error ) => {
				if ( error.code === 'unknown_user' ) {
					return this.props.createSocialUser( socialInfo, 'login' ).then(
						() => this.recordEvent( 'calypso_login_social_signup_success', 'apple' ),
						( createAccountError ) =>
							this.recordEvent( 'calypso_login_social_signup_failure', 'apple', {
								error_code: createAccountError.code,
								error_message: createAccountError.message,
							} )
					);
				} else if ( error.code === 'user_exists' ) {
					this.props.createSocialUserFailed( socialInfo, error );
				}

				this.recordEvent( 'calypso_login_social_login_failure', 'apple', {
					error_code: error.code,
					error_message: error.message,
				} );
			}
		);
	};

	recordEvent = ( eventName, service, params ) =>
		this.props.recordTracksEvent( eventName, {
			social_account_type: service,
			...params,
		} );

	trackLoginAndRememberRedirect = ( service ) => {
		this.recordEvent( 'calypso_login_social_button_click', service );

		if ( this.props.redirectTo ) {
			window.sessionStorage.setItem( 'login_redirect_to', this.props.redirectTo );
		}
	};

	getRedirectUrl = ( service ) => {
		const host = typeof window !== 'undefined' && window.location.host;
		return `https://${ host + login( { isNative: true, socialService: service } ) }`;
	};

	render() {
		const { redirectTo, uxMode } = this.props;
		const uxModeApple = config.isEnabled( 'sign-in-with-apple/redirect' ) ? 'redirect' : uxMode;

		return (
			<Card className="login__social">
				<div className="login__social-buttons">
					<GoogleLoginButton
						clientId={ config( 'google_oauth_client_id' ) }
						responseHandler={ this.handleGoogleResponse }
						uxMode={ uxMode }
						redirectUri={ this.getRedirectUrl( 'google' ) }
						onClick={ this.trackLoginAndRememberRedirect.bind( null, 'google' ) }
						socialServiceResponse={
							this.props.socialService === 'google' ? this.props.socialServiceResponse : null
						}
					/>

					<AppleLoginButton
						clientId={ config( 'apple_oauth_client_id' ) }
						responseHandler={ this.handleAppleResponse }
						uxMode={ uxModeApple }
						redirectUri={ this.getRedirectUrl( 'apple' ) }
						onClick={ this.trackLoginAndRememberRedirect.bind( null, 'apple' ) }
						socialServiceResponse={
							this.props.socialService === 'apple' ? this.props.socialServiceResponse : null
						}
					/>

					<p className="login__social-tos">
						{ this.props.translate(
							"If you continue with Google or Apple and don't already have a WordPress.com account, you" +
								' are creating an account and you agree to our' +
								' {{a}}Terms of Service{{/a}}.',
							{
								components: {
									a: (
										<a
											href={ localizeUrl( 'https://wordpress.com/tos/' ) }
											target="_blank"
											rel="noopener noreferrer"
										/>
									),
								},
							}
						) }
					</p>
				</div>

				{ this.props.isSocialAccountCreating && (
					<InfoNotice text={ this.props.translate( 'Creating your account…' ) } />
				) }

				{ this.props.bearerToken && (
					<WpcomLoginForm
						log={ this.props.username }
						authorization={ 'Bearer ' + this.props.bearerToken }
						redirectTo={ redirectTo || '/start' }
					/>
				) }
			</Card>
		);
	}
}

export default connect(
	( state ) => ( {
		redirectTo: getRedirectToOriginal( state ),
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
