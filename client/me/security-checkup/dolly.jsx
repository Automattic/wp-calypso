import config from '@automattic/calypso-config';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
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
				path="/me/security/ai-assistant"
				materialIcon="smartphone"
				text={ translate( 'Telegram Bot (alpha)' ) }
				description={ translate(
					'Connect your WordPress.com account to @wordpressagentbot to manage your sites from Telegram.'
				) }
			/>
		);
	}
}

export default localize( SecurityCheckupDolly );
