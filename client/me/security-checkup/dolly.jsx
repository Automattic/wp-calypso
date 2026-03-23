import config from '@automattic/calypso-config';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { DollySecurityCheckupIcon } from './dolly-checkup-icon';
import SecurityCheckupNavigationItem from './navigation-item';

class SecurityCheckupDolly extends Component {
	static propTypes = {
		translate: PropTypes.func.isRequired,
	};

	render() {
		const { translate } = this.props;

		if ( ! config.isEnabled( 'dolly/telegram' ) ) {
			return null;
		}

		return (
			<SecurityCheckupNavigationItem
				path="/me/security/dolly"
				icon={ <DollySecurityCheckupIcon /> }
				text={ translate( 'Dolly' ) }
				description={ translate(
					'Chat with Dolly on Telegram to publish, update, and manage your WordPress site from wherever you are.'
				) }
			/>
		);
	}
}

export default localize( SecurityCheckupDolly );
