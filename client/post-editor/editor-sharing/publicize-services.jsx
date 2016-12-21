/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { groupBy, map } from 'lodash';

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

	render() {
		return (
			<ul className="editor-sharing__publicize-services">
				{ map( groupBy( this.props.connections, 'label' ), ( connections, label ) =>
					<li key={ label } className="editor-sharing__publicize-service">
						<h5 className="editor-sharing__publicize-service-heading">{ label }</h5>
						{ connections.map( ( connection ) =>
							<EditorSharingPublicizeConnection
								key={ connection.ID }
								post={ this.props.post }
								connection={ connection }
								onRefresh={ this.props.newConnectionPopup } />
						) }
					</li>
				) }
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
