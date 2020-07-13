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
import { getCurrentUserEmail, isCurrentUserEmailVerified } from 'state/current-user/selectors';
import { getOKIcon, getWarningIcon } from './icons.js';
import getUserSetting from 'state/selectors/get-user-setting';
import isPendingEmailChange from 'state/selectors/is-pending-email-change';
import SecurityCheckupNavigationItem from './navigation-item';

class SecurityCheckupAccountEmail extends React.Component {
	static propTypes = {
		primaryEmail: PropTypes.string,
		primaryEmailVerified: PropTypes.bool,
		translate: PropTypes.func.isRequired,
	};

	render() {
		const {
			isPendingEmailChange: hasPendingEmailChange,
			pendingEmailAddress,
			primaryEmail,
			primaryEmailVerified,
			translate,
		} = this.props;

		let icon, description;

		if ( hasPendingEmailChange ) {
			icon = getWarningIcon();
			description = translate(
				'There is an unconfirmed change of your email address to {{strong}}%(emailAddress)s{{/strong}}.',
				{
					args: {
						emailAddress: pendingEmailAddress,
					},
					components: {
						strong: <strong />,
					},
				}
			);
		} else if ( ! primaryEmailVerified ) {
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
	isPendingEmailChange: isPendingEmailChange( state ),
	pendingEmailAddress: getUserSetting( state, 'new_user_email' ),
	primaryEmail: getCurrentUserEmail( state ),
	primaryEmailVerified: isCurrentUserEmailVerified( state ),
} ) )( localize( SecurityCheckupAccountEmail ) );
