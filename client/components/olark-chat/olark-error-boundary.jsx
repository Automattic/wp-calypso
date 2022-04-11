import config from '@automattic/calypso-config';
import { Component } from 'react';
import { logToLogstash } from 'calypso/lib/logstash';

class OlarkErrorBoundary extends Component {
	state = { error: null };

	componentDidCatch( error ) {
		this.setState( { error } );

		logToLogstash( {
			feature: 'calypso_client',
			message: 'Olark widget error',
			severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
			extra: {
				env: config( 'env_id' ),
				type: 'olark_widget_error',
				message: String( error ),
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

export default OlarkErrorBoundary;
