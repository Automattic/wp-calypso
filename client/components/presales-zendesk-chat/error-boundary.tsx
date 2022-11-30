import config from '@automattic/calypso-config';
import { Component, ErrorInfo } from 'react';
import { logToLogstash } from 'calypso/lib/logstash';

class ZendeskChatErrorBoundary extends Component {
	state = { error: null };

	componentDidCatch( error: Error, errorInfo: ErrorInfo ) {
		this.setState( { error } );

		logToLogstash( {
			feature: 'calypso_client',
			message: 'Zendesk Chat widget error',
			severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
			extra: {
				env: config( 'env_id' ),
				type: 'zendesk_chat_widget_error',
				message: String( error ),
				info: errorInfo,
			},
		} );
	}

	render() {
		if ( this.state.error ) {
			return null;
		}
		return this.props.children;
	}
}

export default ZendeskChatErrorBoundary;
