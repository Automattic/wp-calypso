/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { map, reduce } from 'lodash';

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
		const services = reduce( this.props.connections, ( memo, connection ) => {
			if ( connection.label in memo ) {
				memo[ connection.label ].push( connection );
			} else {
				memo[ connection.label ] = [ connection ];
			}

			return memo;
		}, {} );

		return (
			<ul className="editor-sharing__publicize-services">
				{ map( services, ( connections, label ) =>
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
