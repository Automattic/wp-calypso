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
		loginUser: PropTypes.func.isRequired,
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

	handleLogin = ( service, result ) => {
		const { onSuccess, loginUser } = this.props;

		let redirectTo = this.props.redirectTo;

		// load persisted redirect_to url from session storage, needed for redirect_to to work with google redirect flow
		if ( ! redirectTo ) {
			redirectTo = window.sessionStorage.getItem( 'login_redirect_to' );
		}

		window.sessionStorage.removeItem( 'login_redirect_to' );

		const socialInfo = {
			service: service,
			...result,
		};

		loginUser( socialInfo, redirectTo ).then(
			() => {
				this.recordEvent( 'calypso_login_social_login_success', service );
				onSuccess();
			},
			( error ) => {
				this.reportSocialLoginFailure( { service, socialInfo, error } );
			}
		);
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
							responseHandler={ ( result ) => this.handleLogin( 'google', result ) }
							uxMode={ uxMode }
							redirectUri={ this.getRedirectUri( 'google' ) }
							onClick={ () => {
								this.trackLoginAndRememberRedirect( 'google' );
							} }
							startingPoint="login"
						/>

						<AppleLoginButton
							clientId={ config( 'apple_oauth_client_id' ) }
							responseHandler={ ( result ) => this.handleLogin( 'apple', result ) }
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
							responseHandler={ ( result ) => this.handleLogin( 'github', result ) }
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
		loginUser: loginSocialUser,
		createSocialUserFailed,
		recordTracksEvent,
	}
)( SocialLoginForm );
