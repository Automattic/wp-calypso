import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import QueryUserSettings from 'calypso/components/data/query-user-settings';
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
				<Fragment>
					<QueryUserSettings />
					<SecurityCheckupNavigationItem isPlaceholder={ true } />
				</Fragment>
			);
		}

		let icon;
		let description;

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
			<Fragment>
				<QueryUserSettings />
				<SecurityCheckupNavigationItem
					path={ '/me/security/two-step' }
					materialIcon={ icon }
					text={ translate( 'Two-Step Authentication' ) }
					description={ description }
				/>
			</Fragment>
		);
	}
}

export default connect( ( state ) => ( {
	areUserSettingsLoaded: hasUserSettings( state ),
	hasTwoStepEnabled: isTwoStepEnabled( state ),
	hasTwoStepSmsEnabled: isTwoStepSmsEnabled( state ),
	twoStepSmsPhoneNumber: getUserSetting( state, 'two_step_sms_phone_number' ),
} ) )( localize( SecurityCheckupTwoFactorAuthentication ) );
