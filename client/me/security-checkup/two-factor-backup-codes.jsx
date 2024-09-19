import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import getUserSetting from 'calypso/state/selectors/get-user-setting';
import hasUserSettings from 'calypso/state/selectors/has-user-settings';
import isTwoStepEnabled from 'calypso/state/selectors/is-two-step-enabled';
import { getOKIcon, getWarningIcon } from './icons.js';
import SecurityCheckupNavigationItem from './navigation-item';

class SecurityCheckupTwoFactorBackupCodes extends Component {
	static propTypes = {
		areBackupCodesPrinted: PropTypes.bool,
		areUserSettingsLoaded: PropTypes.bool,
		hasTwoStepEnabled: PropTypes.bool,
		translate: PropTypes.func.isRequired,
	};

	render() {
		const { areBackupCodesPrinted, areUserSettingsLoaded, hasTwoStepEnabled, translate } =
			this.props;

		if ( ! areUserSettingsLoaded ) {
			return <SecurityCheckupNavigationItem isPlaceholder />;
		}

		// Don't show this item if the user doesn't have 2FA enabled.
		if ( ! hasTwoStepEnabled ) {
			return null;
		}

		let icon;
		let description;

		if ( areBackupCodesPrinted ) {
			icon = getOKIcon();
			description = translate( 'You have verified your backup codes for two-step authentication.' );
		} else {
			icon = getWarningIcon();
			description = translate(
				'You have {{strong}}not verified your backup codes{{/strong}} for two-step authentication.',
				{
					components: {
						strong: <strong />,
					},
				}
			);
		}

		return (
			<SecurityCheckupNavigationItem
				path="/me/security/two-step"
				materialIcon={ icon }
				text={ translate( 'Two-Step Backup Codes' ) }
				description={ description }
			/>
		);
	}
}

export default connect( ( state ) => ( {
	areBackupCodesPrinted: getUserSetting( state, 'two_step_backup_codes_printed' ),
	areUserSettingsLoaded: hasUserSettings( state ),
	hasTwoStepEnabled: isTwoStepEnabled( state ),
} ) )( localize( SecurityCheckupTwoFactorBackupCodes ) );
