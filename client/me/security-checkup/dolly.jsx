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
				path="/me/mcp"
				materialIcon="smartphone"
				text={ translate( 'WordPress Agent connections' ) }
				description={ translate( 'Connect WordPress Agent to Slack or Telegram.' ) }
			/>
		);
	}
}

export default localize( SecurityCheckupDolly );
