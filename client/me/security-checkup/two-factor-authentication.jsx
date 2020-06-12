/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getOKIcon, getWarningIcon } from './icons.js';
import getUserSetting from 'state/selectors/get-user-setting';
import hasUserSettings from 'state/selectors/has-user-settings';
import isTwoStepEnabled from 'state/selectors/is-two-step-enabled';
import isTwoStepSmsEnabled from 'state/selectors/is-two-step-sms-enabled';
import QueryUserSettings from 'components/data/query-user-settings';
import SecurityCheckupNavigationItem from './navigation-item';

class SecurityCheckupTwoFactorAuthentication extends React.Component {
	static propTypes = {
		areUserSettingsLoaded: PropTypes.bool,
		hasTwoStepEnabled: PropTypes.bool,
		hasTwoStepSmsEnabled: PropTypes.bool,
		translate: PropTypes.func.isRequired,
		twoStepSmsPhoneNumber: PropTypes.string,
	};

	render() {
		const {
			areUserSettingsLoaded,
			hasTwoStepEnabled,
			hasTwoStepSmsEnabled,
			translate,
			twoStepSmsPhoneNumber,
		} = this.props;

		if ( ! areUserSettingsLoaded ) {
			return (
				<React.Fragment>
					<QueryUserSettings />
					<SecurityCheckupNavigationItem isPlaceholder={ true } />
				</React.Fragment>
			);
		}

		let icon, description;

		if ( hasTwoStepSmsEnabled ) {
			icon = getOKIcon();
			description = translate(
				'You have two-step authentication {{strong}}enabled{{/strong}} using SMS messages to {{strong}}%(phoneNumber)s{{/strong}}.',
				{
					args: {
						phoneNumber: twoStepSmsPhoneNumber,
					},
					components: {
						strong: <strong />,
					},
				}
			);
		} else if ( hasTwoStepEnabled ) {
			icon = getOKIcon();
			description = translate(
				'You have two-step authentication {{strong}}enabled{{/strong}} using an app.',
				{
					components: {
						strong: <strong />,
					},
				}
			);
		} else {
			icon = getWarningIcon();
			description = translate( 'You do not have two-step authentication enabled.' );
		}

		return (
			<SecurityCheckupNavigationItem
				path={ '/me/security/two-step' }
				materialIcon={ icon }
				text={ translate( 'Two-Step Authentication' ) }
				description={ description }
			/>
		);
	}
}

export default connect( ( state ) => ( {
	areUserSettingsLoaded: hasUserSettings( state ),
	hasTwoStepEnabled: isTwoStepEnabled( state ),
	hasTwoStepSmsEnabled: isTwoStepSmsEnabled( state ),
	twoStepSmsPhoneNumber: getUserSetting( state, 'two_step_sms_phone_number' ),
} ) )( localize( SecurityCheckupTwoFactorAuthentication ) );
