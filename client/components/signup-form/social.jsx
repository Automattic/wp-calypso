/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import GoogleLoginButton from 'components/social-buttons/google';
import config from 'config';
import { preventWidows } from 'lib/formatting';

class SocialSignupForm extends Component {
	static propTypes = {
		handleResponse: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	handleGoogleResponse = ( response ) => {
		if ( ! response.Zi || ! response.Zi.access_token || ! response.Zi.id_token ) {
			return;
		}

		this.props.handleResponse( 'google', response.Zi.access_token, response.Zi.id_token );
	};

	render() {
		return (
			<Card className="signup-form__social">
				<p>
					{ preventWidows( this.props.translate( 'Or connect your existing profile to get started faster.' ) ) }
				</p>

				<div className="signup-form__social-buttons">
					<GoogleLoginButton
						clientId={ config( 'google_oauth_client_id' ) }
						responseHandler={ this.handleGoogleResponse } />
				</div>
			</Card>
		);
	}
}

export default localize( SocialSignupForm );
