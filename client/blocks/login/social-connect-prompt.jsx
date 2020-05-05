/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { capitalize } from 'lodash';

/**
 * Internal dependencies
 */
import { Button, Card } from '@automattic/components';
import {
	getSocialAccountLinkAuthInfo,
	getSocialAccountLinkService,
	getRedirectToSanitized,
} from 'state/login/selectors';
import { connectSocialUser } from 'state/login/actions';
import { recordTracksEventWithClientId as recordTracksEvent } from 'state/analytics/actions';
import SocialLogo from 'components/social-logo';
import GoogleIcon from 'components/social-icons/google';
import AppleIcon from 'components/social-icons/apple';

/**
 * Style dependencies
 */
import './social-connect-prompt.scss';

class SocialConnectPrompt extends Component {
	static propTypes = {
		linkingSocialAuthInfo: PropTypes.object,
		linkingSocialService: PropTypes.string,
		onSuccess: PropTypes.func.isRequired,
		redirectTo: PropTypes.string,
		translate: PropTypes.func.isRequired,
	};

	handleClick = ( event ) => {
		const { linkingSocialAuthInfo, linkingSocialService, onSuccess, redirectTo } = this.props;

		event.preventDefault();

		this.props.connectSocialUser( linkingSocialAuthInfo, redirectTo ).then(
			() => {
				this.props.recordTracksEvent( 'calypso_login_social_connect_success', {
					social_account_type: linkingSocialService,
				} );

				onSuccess();
			},
			( error ) => {
				this.props.recordTracksEvent( 'calypso_login_social_connect_failure', {
					social_account_type: linkingSocialService,
					error_code: error.code,
					error_message: error.message,
				} );
			}
		);
	};

	render() {
		return (
			<Card className="login__social-connect-prompt">
				<div className="login__social-connect-prompt-logos">
					{ this.props.linkingSocialService === 'google' && (
						<GoogleIcon className="login__social-connect-prompt-logo" />
					) }
					{ this.props.linkingSocialService === 'apple' && (
						<AppleIcon className="login__social-connect-prompt-logo" />
					) }
					<svg
						className="login__social-connect-prompt-dots"
						width="48px"
						height="4px"
						viewBox="0 0 48 4"
						xmlns="http://www.w3.org/2000/svg"
					>
						<g stroke="none" fill="none" fillRule="evenodd">
							<circle fill="#C8D7E2" cx="2" cy="2" r="2" />
							<circle fill="#C8D7E2" cx="13" cy="2" r="2" />
							<circle fill="#C8D7E2" cx="24" cy="2" r="2" />
							<circle fill="#74DCFC" cx="35" cy="2" r="2" />
							<circle fill="#C8D7E2" cx="46" cy="2" r="2" />
						</g>
					</svg>
					<SocialLogo className="login__social-connect-prompt-logo" icon="wordpress" />
				</div>

				<div className="login__social-connect-prompt-message">
					{ this.props.translate(
						'Connect your WordPress.com account to your %(service)s profile. ' +
							'You will be able to use %(service)s to log in to WordPress.com.',
						{
							args: {
								service: capitalize( this.props.linkingSocialService ),
							},
						}
					) }
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
		redirectTo: getRedirectToSanitized( state ),
	} ),
	{
		connectSocialUser,
		recordTracksEvent,
	}
)( localize( SocialConnectPrompt ) );
