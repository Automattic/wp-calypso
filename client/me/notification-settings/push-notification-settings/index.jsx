import { Card } from '@automattic/components';
import { ExternalLink, ToggleControl } from '@wordpress/components';
import { getLocaleSlug, localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import Notice from 'calypso/components/notice';
import userAgent from 'calypso/lib/user-agent';
import { setEnabledState } from 'calypso/state/push-notifications/actions';
import { getStatus, isApiReady, isEnabled } from 'calypso/state/push-notifications/selectors';

import './style.scss';

function getPlatform( os ) {
	if ( os === 'iOS' ) {
		return 'iOS';
	} else if ( os === 'Android' ) {
		return 'Android';
	}
	return 'Desktop';
}

class PushNotificationSettings extends Component {
	static propTypes = {
		setEnabledState: PropTypes.func.isRequired,
	};

	clickHandler = ( value ) => {
		this.props.setEnabledState( value );
	};

	getBlockedInstructionURL = () => {
		const { browser, platform, isMobile, isAndroid, isIOS } = userAgent;
		const locale = getLocaleSlug();
		const mappedPlatform = getPlatform( platform );

		switch ( browser ) {
			case 'Chrome':
				// Google supports all our locales: https://serpapi.com/google-languages
				return `https://support.google.com/chrome/answer/3220216?hl=${ locale }&co=GENIE.Platform%3D${ mappedPlatform }&oco=1`;
			case 'Safari': {
				if ( isIOS ) {
					// Apple doesn't have docs for this.
					return null;
				}
				return 'https://support.apple.com/guide/safari/customize-website-notifications-sfri40734/mac';
			}
			case 'Edge':
				if ( isMobile ) {
					// MS doesn't have docs for this.
					return null;
				}
				// MS supports all our locales: https://learn.microsoft.com/en-us/dynamics365/fin-ops-core/dev-itpro/help/language-locale
				return `https://support.microsoft.com/${ locale }/microsoft-edge/manage-website-notifications-in-microsoft-edge-0c555609-5bf2-479d-a59d-fb30a0b80b2b`;
			case 'Firefox': {
				if ( isAndroid ) {
					return `https://support.mozilla.org/${ locale }/kb/manage-notifications-firefox-android`;
				} else if ( isIOS ) {
					return `https://support.mozilla.org/${ locale }/kb/turn-push-notifications-or-firefox-ios`;
				}
				return 'https://support.mozilla.org/en-US/kb/push-notifications-firefox';
			}
			default: {
				return null;
			}
		}
	};

	render() {
		let buttonDisabled;
		let isActive;
		let deniedText;

		if ( ! this.props.apiReady ) {
			return null;
		}

		const blockedInstructionUrl = this.getBlockedInstructionURL();

		switch ( this.props.status ) {
			case 'disabling':
				buttonDisabled = true;
				isActive = false;
				break;
			case 'enabling':
				buttonDisabled = true;
				isActive = true;
				break;
			case 'unsubscribed':
				buttonDisabled = false;
				isActive = false;
				break;
			case 'subscribed':
				buttonDisabled = false;
				isActive = true;
				break;
			case 'denied':
				buttonDisabled = true;
				isActive = false;

				deniedText = (
					<Notice
						className="notification-settings-push-notification-settings__instruction"
						showDismiss={ false }
						status="is-info"
						text={
							<div className="notification-settings-push-notification-settings__instruction-actions">
								<div>
									{ this.props.translate(
										'Your browser is currently set to block notifications from WordPress.com.'
									) }
								</div>
								<div>
									{ blockedInstructionUrl &&
										this.props.translate(
											'{{instructionsButton}}View instructions to enable{{/instructionsButton}}',
											{
												components: {
													instructionsButton: (
														<ExternalLink href={ blockedInstructionUrl } target="_blank" />
													),
												},
											}
										) }
								</div>
							</div>
						}
					/>
				);
				break;

			default:
				return null;
		}

		return (
			<>
				{ deniedText }
				<Card className="notification-settings-push-notification-settings__settings">
					<ToggleControl
						disabled={ buttonDisabled }
						checked={ isActive }
						help={ this.props.translate(
							'Get instant notifications for new comments and likes, even when you are not actively using WordPress.com'
						) }
						label={ this.props.translate( 'Browser notifications' ) }
						onChange={ this.clickHandler }
					/>
				</Card>
			</>
		);
	}
}

export default connect(
	( state ) => {
		return {
			apiReady: isApiReady( state ),
			isEnabled: isEnabled( state ),
			status: getStatus( state ),
		};
	},
	{
		setEnabledState: setEnabledState,
	}
)( localize( PushNotificationSettings ) );
