/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import SharingServicesGroup from './services-group';

class SharingConnections extends Component {
	static propTypes = {
		connections: PropTypes.object,
		translate: PropTypes.func,
	};

	render() {
		return (
			<div className="sharing-settings sharing-connections">
				<SharingServicesGroup
					type="publicize"
					title={ this.props.translate( 'Publicize Your Posts' ) }
					connections={ this.props.connections } />
				<SharingServicesGroup
					type="other"
					title={ this.props.translate( 'Other Connections' ) }
					description={ this.props.translate( 'Connect any of these additional services to further enhance your site.' ) }
					connections={ this.props.connections } />
			</div>
		);
	}
}

export default localize( SharingConnections );
