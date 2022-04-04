import config from '@automattic/calypso-config';
import { Component } from 'react';
import { logToLogstash } from 'calypso/lib/logstash';

class OlarkErrorBoundary extends Component {
	constructor( props ) {
		super( props );
		this.state = { error: null, errorInfo: null };
	}

	componentDidCatch( error, errorInfo ) {
		this.setState( {
			error: error,
			errorInfo: errorInfo,
		} );

		logToLogstash( {
			feature: 'calypso_client',
			message: 'Olark widget in signup flow error',
			severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
			extra: {
				env: config( 'env_id' ),
				type: 'olark_signup_flow_error',
				message: String( error ),
				stackTrace: errorInfo.componentStack,
			},
		} );
	}

	render() {
		if ( this.state.errorInfo ) {
			return null;
		}
		return this.props.children;
	}
}

export default OlarkErrorBoundary;
