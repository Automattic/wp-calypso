/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import GoogleLoginButton from 'components/social-buttons/google';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import config from 'config';
import { preventWidows } from 'lib/formatting';

class SocialSignupForm extends Component {
	static propTypes = {
		handleResponse: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
		socialService: PropTypes.string,
		socialServiceResponse: PropTypes.object,
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

	shouldUseRedirectFlow() {
		// If calypso is loaded in a popup, we don't want to open a second popup for social signup
		// let's use the redirect flow instead in that case
		const isPopup = typeof window !== 'undefined' && window.opener && window.opener !== window;
		return isPopup;
	}

	render() {
		const uxMode = this.shouldUseRedirectFlow() ? 'redirect' : 'popup';
		const redirectUri = uxMode === 'redirect' ? `https://${ window.location.host }/start` : null;

		return (
			<Card className="signup-form__social">
				<p>
					{ preventWidows(
						this.props.translate( 'Or connect your existing profile to get started faster.' )
					) }
				</p>

				<div className="signup-form__social-buttons">
					<GoogleLoginButton
						clientId={ config( 'google_oauth_client_id' ) }
						responseHandler={ this.handleGoogleResponse }
						redirectUri={ redirectUri }
						uxMode={ uxMode }
					/>
				</div>
			</Card>
		);
	}
}

export default localize( SocialSignupForm );
