/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { capitalize } from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import SocialLogo from 'social-logos';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import { recordTracksEvent } from 'state/analytics/actions';
import { connectSocialUser } from 'state/login/actions';
import { getSocialAccountLinkAuthInfo, getSocialAccountLinkService, getRedirectTo } from 'state/login/selectors';

class SocialConnectPrompt extends Component {
	static propTypes = {
		linkingSocialAuthInfo: PropTypes.object,
		linkingSocialService: PropTypes.string,
		onSuccess: PropTypes.func.isRequired,
		redirectTo: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	handleClick = ( event ) => {
		const {
			linkingSocialAuthInfo,
			linkingSocialService,
			onSuccess,
			redirectTo,
		} = this.props;

		event.preventDefault();

		this.props.connectSocialUser( linkingSocialAuthInfo, redirectTo )
			.then(
				() => {
					this.props.recordTracksEvent( 'calypso_login_social_connect_success', {
						social_account_type: linkingSocialService
					} );

					onSuccess();
				},
				error => {
					this.props.recordTracksEvent( 'calypso_login_social_connect_failure', {
						social_account_type: linkingSocialService,
						error_code: error.code,
						error_message: error.message
					} );
				}
			);
	};

	render() {
		return (
			<Card className="login__social-connect-prompt">
				<div className="login__social-connect-prompt-logos">
					{ /* eslint-disable max-len */ }
					<svg className="login__social-connect-prompt-logo" viewBox="-2 -2 24 24" xmlns="http://www.w3.org/2000/svg">
						<g fill="none" fillRule="evenodd">
							<path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 0 1-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4" />
							<path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0 0 10 20z" fill="#34A853" />
							<path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 0 0 0 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z" fill="#FBBC05" />
							<path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.192 5.736 7.396 3.977 10 3.977z" fill="#EA4335" />
						</g>
					</svg>
					<svg className="login__social-connect-prompt-dots" width="48px" height="4px" viewBox="0 0 48 4" xmlns="http://www.w3.org/2000/svg">
						<g stroke="none" fill="none" fillRule="evenodd">
							<circle fill="#C8D7E2" cx="2" cy="2" r="2"></circle>
							<circle fill="#C8D7E2" cx="13" cy="2" r="2"></circle>
							<circle fill="#C8D7E2" cx="24" cy="2" r="2"></circle>
							<circle fill="#74DCFC" cx="35" cy="2" r="2"></circle>
							<circle fill="#C8D7E2" cx="46" cy="2" r="2"></circle>
						</g>
					</svg>
					{ /* eslint-enable max-len */ }
					<SocialLogo className="login__social-connect-prompt-logo" icon="wordpress" />
				</div>

				<div className="login__social-connect-prompt-message">
					{ this.props.translate( 'Connect your WordPress.com account to your %(service)s profile. ' +
					'You will be able to use %(service)s to log in to WordPress.com.', {
						args: {
							service: capitalize( this.props.linkingSocialService ),
						}
					} ) }
				</div>

				<div className="login__social-connect-prompt-action">
					<Button primary onClick={ this.handleClick }>
						{ this.props.translate( 'Connect' ) }
					</Button>
				</div>
			</Card>
		);
	}
}

export default connect(
	( state ) => ( {
		linkingSocialAuthInfo: getSocialAccountLinkAuthInfo( state ),
		linkingSocialService: getSocialAccountLinkService( state ),
		redirectTo: getRedirectTo( state ),
	} ),
	{
		connectSocialUser,
		recordTracksEvent,
	}
)( localize( SocialConnectPrompt ) );
