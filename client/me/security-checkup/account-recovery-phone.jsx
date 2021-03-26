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
import {
	getAccountRecoveryPhone,
	isAccountRecoveryPhoneActionInProgress,
	isAccountRecoveryPhoneValidated,
} from 'calypso/state/account-recovery/settings/selectors';
import { getOKIcon, getWarningIcon } from './icons.js';
import QueryAccountRecoverySettings from 'calypso/components/data/query-account-recovery-settings';
import SecurityCheckupNavigationItem from './navigation-item';

class SecurityCheckupAccountRecoveryPhone extends React.Component {
	static propTypes = {
		accountRecoveryPhone: PropTypes.object,
		accountRecoveryPhoneActionInProgress: PropTypes.bool,
		accountRecoveryPhoneValidated: PropTypes.bool,
		translate: PropTypes.func.isRequired,
	};

	render() {
		const {
			accountRecoveryPhone,
			accountRecoveryPhoneActionInProgress,
			accountRecoveryPhoneValidated,
			translate,
		} = this.props;

		if ( accountRecoveryPhoneActionInProgress ) {
			return (
				<React.Fragment>
					<QueryAccountRecoverySettings />
					<SecurityCheckupNavigationItem isPlaceholder={ true } />
				</React.Fragment>
			);
		}

		let icon;
		let description;

		if ( ! accountRecoveryPhone ) {
			icon = getWarningIcon();
			description = translate( 'You do not have a recovery SMS number.' );
		} else if ( ! accountRecoveryPhoneValidated ) {
			icon = getWarningIcon();
			description = translate(
				'You still need to verify your recovery SMS number: {{strong}}%(recoveryPhoneNumber)s{{/strong}}',
				{
					args: {
						recoveryPhoneNumber: accountRecoveryPhone.numberFull,
					},
					components: {
						strong: <strong dir="ltr" />,
					},
				}
			);
		} else {
			icon = getOKIcon();
			description = translate(
				'You have set {{strong}}%(recoveryPhoneNumber)s{{/strong}} as your recovery SMS number.',
				{
					args: {
						recoveryPhoneNumber: accountRecoveryPhone.numberFull,
					},
					components: {
						strong: <strong dir="ltr" />,
					},
				}
			);
		}

		return (
			<SecurityCheckupNavigationItem
				path={ '/me/security/account-recovery' }
				materialIcon={ icon }
				text={ translate( 'Recovery SMS Number' ) }
				description={ description }
			/>
		);
	}
}

export default connect( ( state ) => ( {
	accountRecoveryPhone: getAccountRecoveryPhone( state ),
	accountRecoveryPhoneActionInProgress: isAccountRecoveryPhoneActionInProgress( state ),
	accountRecoveryPhoneValidated: isAccountRecoveryPhoneValidated( state ),
} ) )( localize( SecurityCheckupAccountRecoveryPhone ) );
