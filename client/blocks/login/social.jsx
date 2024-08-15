import config from '@automattic/calypso-config';
import { Card } from '@automattic/components';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import SocialToS from 'calypso/blocks/authentication/social/social-tos.jsx';
import {
	GoogleSocialButton,
	AppleLoginButton,
	GithubSocialButton,
	MagicLoginButton,
	QrCodeLoginButton,
} from 'calypso/components/social-buttons';
import { login } from 'calypso/lib/paths';
import { recordTracksEventWithClientId as recordTracksEvent } from 'calypso/state/analytics/actions';
import { loginSocialUser, createSocialUserFailed } from 'calypso/state/login/actions';
import { getRedirectToOriginal } from 'calypso/state/login/selectors';

import './social.scss';

class SocialLoginForm extends Component {
	static propTypes = {
		recordTracksEvent: PropTypes.func.isRequired,
		redirectTo: PropTypes.string,
		onSuccess: PropTypes.func.isRequired,
		loginSocialUser: PropTypes.func.isRequired,
		uxMode: PropTypes.string.isRequired,
		socialService: PropTypes.string,
		socialServiceResponse: PropTypes.object,
		shouldRenderToS: PropTypes.bool,
		magicLoginLink: PropTypes.string,
		qrLoginLink: PropTypes.string,
		isSocialFirst: PropTypes.bool,
	};

	static defaultProps = {
		shouldRenderToS: false,
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

	handleGitHubResponse = ( { access_token } ) => {
		const { onSuccess, socialService } = this.props;

		if ( socialService !== 'github' ) {
			return;
		}

		let redirectTo = this.props.redirectTo;

		// load persisted redirect_to url from session storage, needed for redirect_to to work with GitHub redirect flow
		if ( ! redirectTo ) {
			redirectTo = window.sessionStorage.getItem( 'login_redirect_to' );
		}

		window.sessionStorage.removeItem( 'login_redirect_to' );

		const socialInfo = {
			service: 'github',
			access_token: access_token,
		};

		this.props.loginSocialUser( socialInfo, redirectTo ).then(
			() => {
				this.recordEvent( 'calypso_login_social_login_success', 'github' );

				onSuccess();
			},
			( error ) => {
				this.reportSocialLoginFailure( { service: 'github', socialInfo, error } );
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

	getRedirectUri = ( service ) => {
		const host = typeof window !== 'undefined' && window.location.host;
		if ( typeof window !== 'undefined' && window.location.hostname === 'calypso.localhost' ) {
			return `http://${ host }${ login( { socialService: service } ) }`;
		}
		return `https://${ host }${ login( { socialService: service } ) }`;
	};

	render() {
		const {
			uxMode,
			shouldRenderToS,
			isWoo,
			socialService,
			socialServiceResponse,
			magicLoginLink,
			isSocialFirst,
			qrLoginLink,
		} = this.props;

		return (
			<Card
				className={ clsx( 'auth-form__social', 'is-login', { 'is-social-first': isSocialFirst } ) }
			>
				<div className="auth-form__social-buttons">
					<div className="auth-form__social-buttons-container">
						<GoogleSocialButton
							clientId={ config( 'google_oauth_client_id' ) }
							responseHandler={ this.handleGoogleResponse }
							uxMode={ uxMode }
							redirectUri={ this.getRedirectUri( 'google' ) }
							onClick={ () => {
								this.trackLoginAndRememberRedirect( 'google' );
							} }
							socialServiceResponse={ socialService === 'google' ? socialServiceResponse : null }
							startingPoint="login"
						/>

						<AppleLoginButton
							clientId={ config( 'apple_oauth_client_id' ) }
							responseHandler={ this.handleAppleResponse }
							uxMode={ uxMode }
							redirectUri={ this.getRedirectUri( 'apple' ) }
							onClick={ () => {
								this.trackLoginAndRememberRedirect( 'apple' );
							} }
							socialServiceResponse={ socialService === 'apple' ? socialServiceResponse : null }
						/>

						<GithubSocialButton
							socialServiceResponse={ socialService === 'github' ? socialServiceResponse : null }
							redirectUri={ this.getRedirectUri( 'github' ) }
							responseHandler={ this.handleGitHubResponse }
							onClick={ () => {
								this.trackLoginAndRememberRedirect( 'github' );
							} }
						/>
						{ ( isSocialFirst || isWoo ) && (
							<>
								{ magicLoginLink && <MagicLoginButton loginUrl={ magicLoginLink } /> }
								{ qrLoginLink && <QrCodeLoginButton loginUrl={ qrLoginLink } /> }
							</>
						) }
					</div>
					{ ! isWoo && shouldRenderToS && <SocialToS /> }
				</div>
				{ isWoo && shouldRenderToS && <SocialToS /> }
			</Card>
		);
	}
}

export default connect(
	( state ) => ( {
		redirectTo: getRedirectToOriginal( state ),
	} ),
	{
		loginSocialUser,
		createSocialUserFailed,
		recordTracksEvent,
	}
)( SocialLoginForm );
