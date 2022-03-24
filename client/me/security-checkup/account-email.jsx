import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import {
	getCurrentUserEmail,
	isCurrentUserEmailVerified,
} from 'calypso/state/current-user/selectors';
import getUserSettings from 'calypso/state/selectors/get-user-settings';
import hasUserSettings from 'calypso/state/selectors/has-user-settings';
import isPendingEmailChange from 'calypso/state/selectors/is-pending-email-change';
import { getOKIcon, getWarningIcon } from './icons.js';
import SecurityCheckupNavigationItem from './navigation-item';

class SecurityCheckupAccountEmail extends Component {
	static propTypes = {
		areUserSettingsLoaded: PropTypes.bool,
		emailChangePending: PropTypes.bool,
		primaryEmail: PropTypes.string,
		primaryEmailVerified: PropTypes.bool,
		translate: PropTypes.func.isRequired,
		userSettings: PropTypes.object,
	};

	render() {
		const {
			areUserSettingsLoaded,
			emailChangePending,
			primaryEmail,
			primaryEmailVerified,
			translate,
			userSettings,
		} = this.props;

		if ( ! areUserSettingsLoaded ) {
			return <SecurityCheckupNavigationItem isPlaceholder />;
		}

		let icon;
		let description;

		if ( ! primaryEmailVerified ) {
			icon = getWarningIcon();
			description = translate(
				'Your account email address is {{strong}}%(emailAddress)s{{/strong}}, but is not verified yet.',
				{
					args: {
						emailAddress: primaryEmail,
					},
					components: {
						strong: <strong />,
					},
				}
			);
		} else if ( emailChangePending ) {
			icon = getWarningIcon();
			description = translate(
				'You are in the process of changing your account email address to {{strong}}%(newEmailAddress)s{{/strong}}, but you still need to confirm the change.',
				{
					args: {
						newEmailAddress: userSettings.new_user_email,
					},
					components: {
						strong: <strong />,
					},
				}
			);
		} else {
			icon = getOKIcon();
			description = translate(
				'Your account email address is {{strong}}%(emailAddress)s{{/strong}}.',
				{
					args: {
						emailAddress: primaryEmail,
					},
					components: {
						strong: <strong />,
					},
				}
			);
		}

		return (
			<SecurityCheckupNavigationItem
				path={ '/me/security/account-email' }
				materialIcon={ icon }
				text={ translate( 'Account Email' ) }
				description={ description }
			/>
		);
	}
}

export default connect( ( state ) => ( {
	areUserSettingsLoaded: hasUserSettings( state ),
	emailChangePending: isPendingEmailChange( state ),
	primaryEmail: getCurrentUserEmail( state ),
	primaryEmailVerified: isCurrentUserEmailVerified( state ),
	userSettings: getUserSettings( state ),
} ) )( localize( SecurityCheckupAccountEmail ) );
