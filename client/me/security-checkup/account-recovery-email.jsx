import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import {
	getAccountRecoveryEmail,
	isAccountRecoveryEmailActionInProgress,
	isAccountRecoveryEmailValidated,
} from 'calypso/state/account-recovery/settings/selectors';
import { getOKIcon, getWarningIcon } from './icons.js';
import SecurityCheckupNavigationItem from './navigation-item';

class SecurityCheckupAccountRecoveryEmail extends Component {
	static propTypes = {
		accountRecoveryEmail: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.string ] ),
		accountRecoveryEmailActionInProgress: PropTypes.bool,
		accountRecoveryEmailValidated: PropTypes.bool,
		translate: PropTypes.func.isRequired,
	};

	render() {
		const {
			accountRecoveryEmail,
			accountRecoveryEmailActionInProgress,
			accountRecoveryEmailValidated,
			translate,
		} = this.props;

		if ( accountRecoveryEmailActionInProgress ) {
			return <SecurityCheckupNavigationItem isPlaceholder />;
		}

		let icon;
		let description;

		if ( ! accountRecoveryEmail ) {
			icon = getWarningIcon();
			description = translate( 'You do not have a recovery email address.' );
		} else if ( ! accountRecoveryEmailValidated ) {
			icon = getWarningIcon();
			description = translate(
				'You still need to verify your recovery email address: {{strong}}%(recoveryEmailAddress)s{{/strong}}',
				{
					args: {
						recoveryEmailAddress: accountRecoveryEmail,
					},
					components: {
						strong: <strong />,
					},
				}
			);
		} else {
			icon = getOKIcon();
			description = translate(
				'You have set {{strong}}%(recoveryEmailAddress)s{{/strong}} as your recovery email address.',
				{
					args: {
						recoveryEmailAddress: accountRecoveryEmail,
					},
					components: {
						strong: <strong />,
					},
				}
			);
		}

		return (
			<SecurityCheckupNavigationItem
				path="/me/security/account-recovery"
				materialIcon={ icon }
				text={ translate( 'Recovery Email' ) }
				description={ description }
			/>
		);
	}
}

export default connect( ( state ) => ( {
	accountRecoveryEmail: getAccountRecoveryEmail( state ),
	accountRecoveryEmailActionInProgress: isAccountRecoveryEmailActionInProgress( state ),
	accountRecoveryEmailValidated: isAccountRecoveryEmailValidated( state ),
} ) )( localize( SecurityCheckupAccountRecoveryEmail ) );
