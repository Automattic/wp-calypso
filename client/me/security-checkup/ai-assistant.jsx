import config from '@automattic/calypso-config';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import wpcom from 'calypso/lib/wp';
import SecurityCheckupNavigationItem from './navigation-item';

class SecurityCheckupAIAssistant extends Component {
	static propTypes = {
		translate: PropTypes.func.isRequired,
	};

	state = {
		isConnected: null,
	};

	componentDidMount() {
		if ( ! config.isEnabled( 'dolly/telegram' ) ) {
			return;
		}

		wpcom.req
			.get( { path: '/telegram-bot/status', apiNamespace: 'wpcom/v2' } )
			.then( ( data ) => {
				const isConnected = Boolean( data?.connected || data?.telegram_user_id != null );
				this.setState( { isConnected } );
			} )
			.catch( () => {
				// If the endpoint doesn't exist or user isn't connected, keep the widget generic.
				this.setState( { isConnected: false } );
			} );
	}

	render() {
		const { translate } = this.props;
		const { isConnected } = this.state;

		if ( ! config.isEnabled( 'dolly/telegram' ) ) {
			return null;
		}

		let description;
		if ( isConnected === null ) {
			description = translate( 'Checking Telegram connection status…' );
		} else if ( isConnected ) {
			description = translate( 'Telegram is connected.' );
		} else {
			description = translate( 'Connect Telegram to enable AI Assistant features.' );
		}

		return (
			<SecurityCheckupNavigationItem
				path="/me/security/ai-assistant"
				materialIcon="smart_toy"
				text={ translate( 'AI Assistant' ) }
				description={ description }
			/>
		);
	}
}

export default localize( SecurityCheckupAIAssistant );
