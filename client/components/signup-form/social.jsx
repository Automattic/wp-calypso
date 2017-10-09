/**
 * External dependencies
 *
 * @format
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
import { shouldUseLoginRedirectFlow } from 'lib/user/utils';

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

	render() {
		const redirectUri = shouldUseLoginRedirectFlow()
			? `https://${ window.location.host }/start`
			: null;

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
					/>
				</div>
			</Card>
		);
	}
}

export default localize( SocialSignupForm );
