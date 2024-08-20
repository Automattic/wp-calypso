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
		socialServiceResponse: PropTypes.object,
		shouldRenderToS: PropTypes.bool,
		magicLoginLink: PropTypes.string,
		qrLoginLink: PropTypes.string,
		isSocialFirst: PropTypes.bool,
	};

	static defaultProps = {
		shouldRenderToS: false,
	};

	handleLogin = ( result ) => {
		const socialLoginUsed = window.sessionStorage.getItem( 'social_login_used' );

		if ( ! result || socialLoginUsed !== result.service ) {
			return;
		}

		const { onSuccess, loginUser } = this.props;

		let redirectTo = this.props.redirectTo;

		// load persisted redirect_to url from session storage, needed for redirect_to to work with google redirect flow
		if ( ! redirectTo ) {
			redirectTo = window.sessionStorage.getItem( 'login_redirect_to' );
		}

		window.sessionStorage.removeItem( 'login_redirect_to' );
		window.sessionStorage.removeItem( 'social_login_used' );

		loginUser( result, redirectTo ).then(
			() => {
				this.recordEvent( 'calypso_login_social_login_success', result.service );
				onSuccess();
			},
			( error ) => {
				if ( error.code === 'user_exists' || error.code === 'unknown_user' ) {
					this.props.createSocialUserFailed( result, error, 'login' );
					return;
				}

				this.recordEvent( 'calypso_login_social_login_failure', result.service, {
					error_code: error.code,
					error_message: error.message,
				} );
			}
		);
	};

	trackLoginAndRememberRedirect = ( event ) => {
		const service = event.currentTarget.getAttribute( 'data-social-service' );
		this.recordEvent( 'calypso_login_social_button_click', service );

		window.sessionStorage.setItem( 'social_login_used', service );

		if ( this.props.redirectTo && typeof window !== 'undefined' ) {
			window.sessionStorage.setItem( 'login_redirect_to', this.props.redirectTo );
		}
	};

	recordEvent = ( eventName, service, params ) =>
		this.props.recordTracksEvent( eventName, {
			social_account_type: service,
			...params,
		} );

	render() {
		const {
			shouldRenderToS,
			isWoo,
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
							responseHandler={ this.handleLogin }
							onClick={ this.trackLoginAndRememberRedirect }
							isLogin
						/>

						<AppleLoginButton
							responseHandler={ this.handleLogin }
							onClick={ this.trackLoginAndRememberRedirect }
							socialServiceResponse={ socialServiceResponse }
							isLogin
						/>

						<GithubSocialButton
							responseHandler={ this.handleLogin }
							onClick={ this.trackLoginAndRememberRedirect }
							socialServiceResponse={ socialServiceResponse }
							isLogin
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
