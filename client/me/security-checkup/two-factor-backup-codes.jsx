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
import getUserSetting from 'calypso/state/selectors/get-user-setting';
import hasUserSettings from 'calypso/state/selectors/has-user-settings';
import isTwoStepEnabled from 'calypso/state/selectors/is-two-step-enabled';
import QueryUserSettings from 'calypso/components/data/query-user-settings';
import SecurityCheckupNavigationItem from './navigation-item';

class SecurityCheckupTwoFactorBackupCodes extends React.Component {
	static propTypes = {
		areBackupCodesPrinted: PropTypes.bool,
		areUserSettingsLoaded: PropTypes.bool,
		hasTwoStepEnabled: PropTypes.bool,
		translate: PropTypes.func.isRequired,
	};

	render() {
		const {
			areBackupCodesPrinted,
			areUserSettingsLoaded,
			hasTwoStepEnabled,
			translate,
		} = this.props;

		if ( ! areUserSettingsLoaded ) {
			return (
				<React.Fragment>
					<QueryUserSettings />
					<SecurityCheckupNavigationItem isPlaceholder />
				</React.Fragment>
			);
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
			<React.Fragment>
				<QueryUserSettings />
				<SecurityCheckupNavigationItem
					path={ '/me/security/two-step' }
					materialIcon={ icon }
					text={ translate( 'Two-Step Backup Codes' ) }
					description={ description }
				/>
			</React.Fragment>
		);
	}
}

export default connect( ( state ) => ( {
	areBackupCodesPrinted: getUserSetting( state, 'two_step_backup_codes_printed' ),
	areUserSettingsLoaded: hasUserSettings( state ),
	hasTwoStepEnabled: isTwoStepEnabled( state ),
} ) )( localize( SecurityCheckupTwoFactorBackupCodes ) );
