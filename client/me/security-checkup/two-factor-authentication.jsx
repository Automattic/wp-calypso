import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import getUserSetting from 'calypso/state/selectors/get-user-setting';
import hasUserSettings from 'calypso/state/selectors/has-user-settings';
import isTwoStepEnabled from 'calypso/state/selectors/is-two-step-enabled';
import isTwoStepSmsEnabled from 'calypso/state/selectors/is-two-step-sms-enabled';
import { getOKIcon, getWarningIcon } from './icons.js';
import SecurityCheckupNavigationItem from './navigation-item';

class SecurityCheckupTwoFactorAuthentication extends Component {
	static propTypes = {
		areUserSettingsLoaded: PropTypes.bool,
		hasTwoStepEnabled: PropTypes.bool,
		hasTwoStepSmsEnabled: PropTypes.bool,
		hasTwoStepSecurityKeyEnabled: PropTypes.bool,
		hasTwoStepEnhancedSecurity: PropTypes.bool,
		translate: PropTypes.func.isRequired,
		twoStepSmsPhoneNumber: PropTypes.string,
		isEmailVerified: PropTypes.bool,
	};

	render() {
		const {
			areUserSettingsLoaded,
			hasTwoStepEnabled,
			hasTwoStepSmsEnabled,
			translate,
			twoStepSmsPhoneNumber,
			hasTwoStepSecurityKeyEnabled,
			hasTwoStepEnhancedSecurity,
			isEmailVerified,
		} = this.props;

		if ( ! areUserSettingsLoaded ) {
			return <SecurityCheckupNavigationItem isPlaceholder />;
		}

		let icon;
		let description;

		// Email verification is prioritized over other two-factor authentication conditions.
		if ( ! isEmailVerified ) {
			icon = getWarningIcon();
			description = translate(
				'To enable Two-Step Authentication, please verify your email address first.'
			);
		} else if ( ! hasTwoStepSmsEnabled && ! hasTwoStepEnabled ) {
			icon = getWarningIcon();
			description = translate( 'You do not have two-step authentication enabled.' );
		} else {
			icon = getOKIcon();

			if ( hasTwoStepEnhancedSecurity ) {
				description = translate(
					'You have two-step authentication {{strong}}enabled{{/strong}} using security keys.',
					{
						components: {
							strong: <strong />,
						},
					}
				);
			} else if ( hasTwoStepSmsEnabled ) {
				const options = {
					args: {
						phoneNumber: twoStepSmsPhoneNumber,
					},
					components: {
						strong: <strong />,
					},
				};

				description = hasTwoStepSecurityKeyEnabled
					? translate(
							'You have two-step authentication {{strong}}enabled{{/strong}} using SMS messages to {{strong}}%(phoneNumber)s{{/strong}}, and security keys have been registered.',
							options
					  )
					: translate(
							'You have two-step authentication {{strong}}enabled{{/strong}} using SMS messages to {{strong}}%(phoneNumber)s{{/strong}}.',
							options
					  );
			} else if ( hasTwoStepEnabled ) {
				const options = {
					components: {
						strong: <strong />,
					},
				};

				description = hasTwoStepSecurityKeyEnabled
					? translate(
							'You have two-step authentication {{strong}}enabled{{/strong}} using an app, and security keys have been registered.',
							options
					  )
					: translate(
							'You have two-step authentication {{strong}}enabled{{/strong}} using an app.',
							options
					  );
			}
		}

		return (
			<SecurityCheckupNavigationItem
				path="/me/security/two-step"
				materialIcon={ icon }
				text={ translate( 'Two-Step Authentication' ) }
				description={ description }
				disabled={ ! isEmailVerified }
			/>
		);
	}
}

export default connect( ( state ) => ( {
	areUserSettingsLoaded: hasUserSettings( state ),
	hasTwoStepEnabled: isTwoStepEnabled( state ),
	hasTwoStepSmsEnabled: isTwoStepSmsEnabled( state ),
	twoStepSmsPhoneNumber: getUserSetting( state, 'two_step_sms_phone_number' ),
	hasTwoStepSecurityKeyEnabled: getUserSetting( state, 'two_step_security_key_enabled' ),
	hasTwoStepEnhancedSecurity: getUserSetting( state, 'two_step_enhanced_security' ),
	isEmailVerified: isCurrentUserEmailVerified( state ),
} ) )( localize( SecurityCheckupTwoFactorAuthentication ) );
