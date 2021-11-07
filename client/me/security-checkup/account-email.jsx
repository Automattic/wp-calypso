import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import {
	getCurrentUserEmail,
	isCurrentUserEmailVerified,
} from 'calypso/state/current-user/selectors';
import { getOKIcon, getWarningIcon } from './icons.js';
import SecurityCheckupNavigationItem from './navigation-item';

class SecurityCheckupAccountEmail extends Component {
	static propTypes = {
		primaryEmail: PropTypes.string,
		primaryEmailVerified: PropTypes.bool,
		translate: PropTypes.func.isRequired,
	};

	render() {
		const { primaryEmail, primaryEmailVerified, translate } = this.props;

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
				path={ '/me/account' }
				materialIcon={ icon }
				text={ translate( 'Account Email' ) }
				description={ description }
			/>
		);
	}
}

export default connect( ( state ) => ( {
	primaryEmail: getCurrentUserEmail( state ),
	primaryEmailVerified: isCurrentUserEmailVerified( state ),
} ) )( localize( SecurityCheckupAccountEmail ) );
