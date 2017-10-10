/**
 * External dependencies
 *
 * @format
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
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
import { login } from 'lib/paths';

function isSafari() {
	return typeof window !== 'undefined' && window.navigator.userAgent.match( /safari/i );
}

function shouldUseRedirectFlow() {
	// If calypso is loaded in a popup, we don't want to open a second popup for social login
	// let's use the redirect flow instead in that case
	const isPopup = typeof window !== 'undefined' && window.opener && window.opener !== window;
	// also disable the popup flow for all safari versions
	// See https://github.com/google/google-api-javascript-client/issues/297#issuecomment-333869742
	return isPopup || isSafari();
}

class SocialLoginForm extends Component {
	static propTypes = {
		createSocialUser: PropTypes.func.isRequired,
		recordTracksEvent: PropTypes.func.isRequired,
		redirectTo: PropTypes.string,
		onSuccess: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		loginSocialUser: PropTypes.func.isRequired,
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

		if ( ! response.Zi || ! response.Zi.access_token || ! response.Zi.id_token ) {
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
			access_token: response.Zi.access_token,
			id_token: response.Zi.id_token,
		};

		this.props.loginSocialUser( socialInfo, redirectTo ).then(
			() => {
				this.recordEvent( 'calypso_login_social_login_success' );

				onSuccess( redirectTo );
			},
			error => {
				if ( error.code === 'unknown_user' ) {
					return this.props.createSocialUser( socialInfo, 'login' ).then(
						() => this.recordEvent( 'calypso_login_social_signup_success' ),
						createAccountError =>
							this.recordEvent( 'calypso_login_social_signup_failure', {
								error_code: createAccountError.code,
								error_message: createAccountError.message,
							} )
					);
				} else if ( error.code === 'user_exists' ) {
					this.props.createSocialUserFailed( 'google', response.Zi.id_token, error );
				}

				this.recordEvent( 'calypso_login_social_login_failure', {
					error_code: error.code,
					error_message: error.message,
				} );
			}
		);
	};

	recordEvent = ( eventName, params ) =>
		this.props.recordTracksEvent( eventName, {
			social_account_type: 'google',
			...params,
		} );

	trackGoogleLogin = () => {
		this.recordEvent( 'calypso_login_social_button_click' );

		if ( this.props.redirectTo ) {
			window.sessionStorage.setItem( 'login_redirect_to', this.props.redirectTo );
		}
	};

	renderText() {
		if ( this.props.linkingSocialService ) {
			return (
				<p className="login__social-text">
					{ this.props.translate( 'Or, choose a different %(service)s account:', {
						args: {
							service: capitalize( this.props.linkingSocialService ),
						},
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
		const { redirectTo } = this.props;
		const redirectUri = shouldUseRedirectFlow()
			? `https://${ ( typeof window !== 'undefined' && window.location.host ) +
					login( { isNative: true, socialService: 'google' } ) }`
			: null;

		return (
			<div className="login__social">
				{ this.renderText() }

				<div className="login__social-buttons">
					<GoogleLoginButton
						clientId={ config( 'google_oauth_client_id' ) }
						responseHandler={ this.handleGoogleResponse }
						redirectUri={ redirectUri }
						onClick={ this.trackGoogleLogin }
					/>
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
			</div>
		);
	}
}

export default connect(
	state => ( {
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
