import config from '@automattic/calypso-config';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import AppleLoginButton from 'calypso/components/social-buttons/apple';
import GoogleLoginButton from 'calypso/components/social-buttons/google';
import { preventWidows } from 'calypso/lib/formatting';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getCurrentRoute from 'calypso/state/selectors/get-current-route';
import SocialSignupToS from './social-signup-tos';

class SocialSignupForm extends Component {
	static propTypes = {
		compact: PropTypes.bool,
		handleResponse: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		socialService: PropTypes.string,
		socialServiceResponse: PropTypes.object,
		disableTosText: PropTypes.bool,
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

	handleGoogleResponse = ( response, triggeredByUser = true ) => {
		if ( ! response.getAuthResponse ) {
			return;
		}

		const tokens = response.getAuthResponse();

		if ( ! tokens || ! tokens.access_token || ! tokens.id_token ) {
			return;
		}

		if ( ! triggeredByUser && this.props.socialService !== 'google' ) {
			return;
		}

		this.props.handleResponse( 'google', tokens.access_token, tokens.id_token );
	};

	trackSocialLogin = ( service ) => {
		this.props.recordTracksEvent( 'calypso_login_social_button_click', {
			social_account_type: service,
		} );
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

	render() {
		const uxMode = this.shouldUseRedirectFlow() ? 'redirect' : 'popup';
		const host = typeof window !== 'undefined' && window.location.host;
		const redirectUri = `https://${ host }/start/user`;
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
						<GoogleLoginButton
							clientId={ config( 'google_oauth_client_id' ) }
							responseHandler={ this.handleGoogleResponse }
							uxMode={ uxMode }
							redirectUri={ redirectUri }
							onClick={ () => this.trackSocialLogin( 'google' ) }
							socialServiceResponse={
								this.props.socialService === 'google' ? this.props.socialServiceResponse : null
							}
							isReskinned={ this.props.isReskinned }
						/>

						<AppleLoginButton
							clientId={ config( 'apple_oauth_client_id' ) }
							responseHandler={ this.handleAppleResponse }
							uxMode={ uxModeApple }
							redirectUri={ redirectUri }
							onClick={ () => this.trackSocialLogin( 'apple' ) }
							socialServiceResponse={
								this.props.socialService === 'apple' ? this.props.socialServiceResponse : null
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
