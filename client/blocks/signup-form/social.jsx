import config from '@automattic/calypso-config';
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import AppleLoginButton from 'calypso/components/social-buttons/apple';
import GoogleSocialButton from 'calypso/components/social-buttons/google';
import { preventWidows } from 'calypso/lib/formatting';
import { login } from 'calypso/lib/paths';
import { isWpccFlow } from 'calypso/signup/utils';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import SocialSignupToS from './social-signup-tos';

const debug = debugFactory( 'calypso:signup:social' );

class SocialSignupForm extends Component {
	static propTypes = {
		compact: PropTypes.bool,
		handleResponse: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		socialService: PropTypes.string,
		socialServiceResponse: PropTypes.object,
		disableTosText: PropTypes.bool,
		flowName: PropTypes.string,
		redirectToAfterLoginUrl: PropTypes.string,
	};

	static defaultProps = {
		compact: false,
	};

	handleAppleResponse = ( response ) => {
		if ( ! response.id_token ) {
			return;
		}

		const extraUserData = response.user && {
			user_name: response.user.name,
			user_email: response.user.email,
		};

		this.props.handleResponse( 'apple', null, response.id_token, extraUserData );
	};

	handleGoogleResponse = ( tokens, triggeredByUser = true ) => {
		if ( ! triggeredByUser && this.props.socialService !== 'google' ) {
			return;
		}

		this.props.recordTracksEvent( 'calypso_signup_social_button_success', {
			social_account_type: 'google',
		} );

		this.props.handleResponse( 'google', tokens.access_token, tokens.id_token );
	};

	trackAndPossiblyRememberSocialSignup = ( service ) => {
		this.props.recordTracksEvent( 'calypso_signup_social_button_click', {
			social_account_type: service,
		} );

		if ( isWpccFlow( this.props.flowName ) && this.props.redirectToAfterLoginUrl ) {
			try {
				// Persist the redirect URL for the redirect flow so that we can redirect the user back to original page after login. See ./client/blocks/login for more details.
				window.sessionStorage.setItem( 'login_redirect_to', this.props.redirectToAfterLoginUrl );
			} catch ( e ) {
				debug( 'Set login_redirect_to session error', e );
			}
		}
	};

	shouldUseRedirectFlow() {
		const { currentRoute } = this.props;

		// If calypso is loaded in a popup, we don't want to open a second popup for social signup
		// let's use the redirect flow instead in that case
		let isPopup = typeof window !== 'undefined' && window.opener && window.opener !== window;

		// Jetpack Connect-in-place auth flow contains special reserved args, so we want a popup for social signup.
		// See p1HpG7-7nj-p2 for more information.
		if ( isPopup && '/jetpack/connect/authorize' === currentRoute ) {
			isPopup = false;
		}

		return isPopup;
	}

	getRedirectUri = ( socialService ) => {
		const origin = typeof window !== 'undefined' && window.location.origin;

		// If the user is in the WPCC flow, we want to redirect user to login callback so that we can automatically log them in.
		return isWpccFlow( this.props.flowName )
			? `${ origin + login( { socialService } ) }`
			: `${ origin }/start/user`;
	};

	render() {
		const uxMode = this.shouldUseRedirectFlow() ? 'redirect' : 'popup';
		const uxModeApple = config.isEnabled( 'sign-in-with-apple/redirect' ) ? 'redirect' : uxMode;

		return (
			// Note: we allow social sign-in on the Desktop app, but not social sign-up. Existing config flags do
			// not distinguish between sign-in and sign-up but instead use the catch-all `signup/social` flag.
			// Therefore we need to make an exception for the desktop app directly in this component because there
			// are many places in which the social signup form is rendered based only on the presence of the
			// `signup/social` config flag.
			! config.isEnabled( 'desktop' ) && (
				<div className="signup-form__social">
					{ ! this.props.compact && (
						<p>{ preventWidows( this.props.translate( 'Or create an account using:' ) ) }</p>
					) }

					<div className="signup-form__social-buttons">
						<GoogleSocialButton
							clientId={ config( 'google_oauth_client_id' ) }
							responseHandler={ this.handleGoogleResponse }
							uxMode={ uxMode }
							redirectUri={ this.getRedirectUri( 'google' ) }
							onClick={ () => this.trackAndPossiblyRememberSocialSignup( 'google' ) }
							socialServiceResponse={
								this.props.socialService === 'google' ? this.props.socialServiceResponse : null
							}
							startingPoint={ 'signup' }
							isReskinned={ this.props.isReskinned }
						/>

						<AppleLoginButton
							clientId={ config( 'apple_oauth_client_id' ) }
							responseHandler={ this.handleAppleResponse }
							uxMode={ uxModeApple }
							redirectUri={ this.getRedirectUri( 'apple' ) }
							onClick={ () => {
								this.trackAndPossiblyRememberSocialSignup( 'apple' );
							} }
							socialServiceResponse={
								this.props.socialService === 'apple' ? this.props.socialServiceResponse : null
							}
							originalUrlPath={
								// Set the original URL path for wpcc flow so that we can redirect the user back to /start/wpcc after Apple callback.
								isWpccFlow( this.props.flowName ) ? window.location.pathname : null
							}
							// Attach the query string to the state so we can pass it back to the server to show the correct UI.
							// We need this because Apple doesn't allow to have dynamic parameters in redirect_uri.
							queryString={
								isWpccFlow( this.props.flowName ) ? window.location.search.slice( 1 ) : null
							}
						/>

						{ ! this.props.disableTosText && <SocialSignupToS /> }
					</div>
				</div>
			)
		);
	}
}

export default connect(
	( state ) => ( {
		currentRoute: getCurrentRoute( state ),
	} ),
	{ recordTracksEvent }
)( localize( SocialSignupForm ) );
