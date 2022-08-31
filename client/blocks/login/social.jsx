import config from '@automattic/calypso-config';
import { Card } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import AppleLoginButton from 'calypso/components/social-buttons/apple';
import GoogleSocialButton from 'calypso/components/social-buttons/google';
import { login } from 'calypso/lib/paths';
import WpcomLoginForm from 'calypso/signup/wpcom-login-form';
import { recordTracksEventWithClientId as recordTracksEvent } from 'calypso/state/analytics/actions';
import { loginSocialUser, createSocialUserFailed } from 'calypso/state/login/actions';
import {
	getCreatedSocialAccountUsername,
	getCreatedSocialAccountBearerToken,
	getRedirectToOriginal,
} from 'calypso/state/login/selectors';

import './social.scss';

class SocialLoginForm extends Component {
	static propTypes = {
		recordTracksEvent: PropTypes.func.isRequired,
		redirectTo: PropTypes.string,
		onSuccess: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		loginSocialUser: PropTypes.func.isRequired,
		uxMode: PropTypes.string.isRequired,
		linkingSocialService: PropTypes.string,
		socialService: PropTypes.string,
		socialServiceResponse: PropTypes.object,
		shouldRenderToS: PropTypes.bool,
	};

	static defaultProps = {
		linkingSocialService: '',
		shouldRenderToS: true,
	};

	reportSocialLoginFailure = ( { service, socialInfo, error } ) => {
		if ( error.code === 'user_exists' || error.code === 'unknown_user' ) {
			this.props.createSocialUserFailed( socialInfo, error, 'login' );
			return;
		}

		this.recordEvent( 'calypso_login_social_login_failure', service, {
			error_code: error.code,
			error_message: error.message,
		} );
	};

	handleGoogleResponse = ( tokens, triggeredByUser = true ) => {
		const { onSuccess, socialService } = this.props;
		let redirectTo = this.props.redirectTo;

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
				this.reportSocialLoginFailure( { service: 'google', socialInfo, error } );
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
				this.reportSocialLoginFailure( { service: 'apple', socialInfo, error } );
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

		if ( this.props.redirectTo && typeof window !== 'undefined' ) {
			window.sessionStorage.setItem( 'login_redirect_to', this.props.redirectTo );
		}
	};

	getRedirectUrl = ( service ) => {
		const host = typeof window !== 'undefined' && window.location.host;
		return `https://${ host + login( { socialService: service } ) }`;
	};

	renderSocialTos = () => {
		const { redirectTo, translate } = this.props;

		const isJetpackMagicLinkSignUpFlow =
			redirectTo &&
			redirectTo.includes( 'jetpack/connect' ) &&
			config.isEnabled( 'jetpack/magic-link-signup' );

		const tosLink = (
			<a
				href={ localizeUrl( 'https://wordpress.com/tos/' ) }
				target="_blank"
				rel="noopener noreferrer"
			/>
		);
		const privacyLink = (
			<a
				href={ localizeUrl( 'https://automattic.com/privacy/' ) }
				target="_blank"
				rel="noopener noreferrer"
			/>
		);

		if ( isJetpackMagicLinkSignUpFlow ) {
			return (
				<>
					<p className="login__social-tos">
						{ translate(
							'By continuing, you agree to our {{tosLink}}Terms of' +
								' Service{{/tosLink}} and acknowledge that you have read our' +
								' {{privacyLink}}Privacy Policy{{/privacyLink}}.',
							{
								components: {
									tosLink,
									privacyLink,
								},
							}
						) }
					</p>
					<p className="login__social-tos">
						{ translate(
							'If you continue with Google, Apple, or an email that isn’t registered yet,' +
								' you are creating a new WordPress.com account.'
						) }
					</p>
				</>
			);
		}
		return (
			<p className="login__social-tos">
				{ translate(
					'If you continue with Google or Apple,' +
						' you agree to our' +
						' {{tosLink}}Terms of Service{{/tosLink}}, and have' +
						' read our {{privacyLink}}Privacy Policy{{/privacyLink}}.',
					{
						components: {
							tosLink,
							privacyLink,
						},
					}
				) }
			</p>
		);
	};

	render() {
		const { redirectTo, uxMode } = this.props;
		const uxModeApple = config.isEnabled( 'sign-in-with-apple/redirect' ) ? 'redirect' : uxMode;

		return (
			<Card className="login__social">
				<div className="login__social-buttons">
					<div className=" login__social-buttons-container">
						<GoogleSocialButton
							clientId={ config( 'google_oauth_client_id' ) }
							responseHandler={ this.handleGoogleResponse }
							uxMode={ uxMode }
							redirectUri={ this.getRedirectUrl( 'google' ) }
							onClick={ this.trackLoginAndRememberRedirect.bind( null, 'google' ) }
							socialServiceResponse={
								this.props.socialService === 'google' ? this.props.socialServiceResponse : null
							}
							startingPoint={ 'login' }
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
					</div>

					{ this.props.shouldRenderToS && this.renderSocialTos() }
				</div>

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
		bearerToken: getCreatedSocialAccountBearerToken( state ),
		username: getCreatedSocialAccountUsername( state ),
	} ),
	{
		loginSocialUser,
		createSocialUserFailed,
		recordTracksEvent,
	}
)( localize( SocialLoginForm ) );
