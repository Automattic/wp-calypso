/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { filter, uniqBy } from 'lodash';

/**
 * Internal dependencies
 */
import EditorSharingPublicizeConnection from './publicize-connection';
import { getCurrentUserId } from 'state/current-user/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteUserConnections } from 'state/sharing/publicize/selectors';

class EditorSharingPublicizeServices extends Component {
	static propTypes = {
		post: PropTypes.object,
		connections: PropTypes.array.isRequired,
		newConnectionPopup: PropTypes.func.isRequired
	};

	static defaultProps = {
		post: Object.freeze( {} ),
	};

	renderServices() {
		const services = uniqBy( this.props.connections.map( ( { label, service } ) => ( { label, service } ) ), 'service' );

		return services.map( ( { label, service } ) =>
			<li key={ service } className="editor-sharing__publicize-service">
				<h5 className="editor-sharing__publicize-service-heading">{ label }</h5>
				{ this.renderConnections( service ) }
			</li>
		);
	}

	/**
	 * Displays Publicize connections for the passed service.
	 *
	 * @param {String} service Slug of Keyring service.
	 * @return {Object|DOMElement} React Element.
	 */
	renderConnections( service ) {
		return filter( this.props.connections, { service } ).map( ( connection ) =>
			<EditorSharingPublicizeConnection
				key={ connection.ID }
				post={ this.props.post }
				connection={ connection }
				onRefresh={ this.props.newConnectionPopup } />
		);
	}

	render() {
		return (
			<ul className="editor-sharing__publicize-services">
				{ this.renderServices() }
			</ul>
		);
	}
}

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const userId = getCurrentUserId( state );

		return {
			connections: getSiteUserConnections( state, siteId, userId ),
		};
	},
)( EditorSharingPublicizeServices );
