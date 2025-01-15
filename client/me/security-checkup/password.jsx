import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import getUserSettings from 'calypso/state/selectors/get-user-settings';
import hasUserSettings from 'calypso/state/selectors/has-user-settings';
import { getOKIcon, getWarningIcon } from './icons.js';
import SecurityCheckupNavigationItem from './navigation-item';

class SecurityCheckupPassword extends Component {
	static propTypes = {
		translate: PropTypes.func.isRequired,
	};

	getDescriptionAndIcon() {
		const { translate, userSettings } = this.props;

		if ( userSettings.is_passwordless_user ) {
			return {
				description: translate( 'You don’t have a password set.' ),
				materialIcon: getWarningIcon(),
			};
		}

		return {
			description: translate( 'You have a password set, but you can change it at any time.' ),
			materialIcon: getOKIcon(),
		};
	}

	render() {
		const { translate, areUserSettingsLoaded } = this.props;

		if ( ! areUserSettingsLoaded ) {
			return <SecurityCheckupNavigationItem isPlaceholder />;
		}

		return (
			<SecurityCheckupNavigationItem
				{ ...this.getDescriptionAndIcon() }
				path="/me/security/password"
				text={ translate( 'Password' ) }
			/>
		);
	}
}

export default connect( ( state ) => ( {
	areUserSettingsLoaded: hasUserSettings( state ),
	userSettings: getUserSettings( state ),
} ) )( localize( SecurityCheckupPassword ) );
