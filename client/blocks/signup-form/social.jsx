/** @format */

/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AppleLoginButton from 'components/social-buttons/apple';
import config from 'config';
import getCurrentRoute from 'state/selectors/get-current-route';
import GoogleLoginButton from 'components/social-buttons/google';
import { preventWidows } from 'lib/formatting';
import { recordTracksEvent } from 'state/analytics/actions';

class SocialSignupForm extends Component {
	static propTypes = {
		compact: PropTypes.bool,
		handleResponse: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		socialService: PropTypes.string,
		socialServiceResponse: PropTypes.object,
	};

	static defaultProps = {
		compact: false,
	};

	handleAppleResponse = response => {
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
		if ( ! response.Zi || ! response.Zi.access_token || ! response.Zi.id_token ) {
			return;
		}

		if ( ! triggeredByUser && this.props.socialService !== 'google' ) {
			return;
		}

		this.props.handleResponse( 'google', response.Zi.access_token, response.Zi.id_token );
	};

	trackSocialLogin = service => {
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
		const redirectUri = uxMode === 'redirect' ? `https://${ window.location.host }/start` : null;

		return (
			<div className="signup-form__social">
				{ ! this.props.compact && (
					<p>{ preventWidows( this.props.translate( 'Or create an account using:' ) ) }</p>
				) }

				<div className="signup-form__social-buttons">
					<GoogleLoginButton
						clientId={ config( 'google_oauth_client_id' ) }
						responseHandler={ this.handleGoogleResponse }
						redirectUri={ redirectUri }
						uxMode={ uxMode }
						onClick={ () => this.trackSocialLogin( 'google' ) }
					/>

					<AppleLoginButton
						responseHandler={ this.handleAppleResponse }
						onClick={ () => this.trackSocialLogin( 'apple' ) }
					/>

					<p className="signup-form__social-buttons-tos">
						{ this.props.translate(
							"If you continue with Google or Apple and don't already have a WordPress.com account, you" +
								' are creating an account and you agree to our' +
								' {{a}}Terms of Service{{/a}}.',
							{
								components: {
									a: <a href="https://wordpress.com/tos" />,
								},
							}
						) }
					</p>
				</div>
			</div>
		);
	}
}

export default connect(
	state => ( {
		currentRoute: getCurrentRoute( state ),
	} ),
	{ recordTracksEvent }
)( localize( SocialSignupForm ) );
