import config from '@automattic/calypso-config';
import { Component, ReactNode } from 'react';
import { logToLogstash } from 'calypso/lib/logstash';

interface CrowdsignalPollErrorBoundaryProps {
	children: ReactNode;
}

class CrowdsignalPollErrorBoundary extends Component< CrowdsignalPollErrorBoundaryProps > {
	state = { error: null };

	componentDidCatch( error: Error ) {
		this.setState( { error } );

		logToLogstash( {
			feature: 'calypso_client',
			message: 'Reader Crowdsignal poll error',
			severity: config( 'env_id' ) === 'production' ? 'error' : 'debug',
			extra: {
				env: config( 'env_id' ),
				type: 'reader_crowdsignal_poll_error',
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

export default CrowdsignalPollErrorBoundary;
