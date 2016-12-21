/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { groupBy, map } from 'lodash';

/**
 * Internal dependencies
 */
import EditorSharingPublicizeConnection from './publicize-connection';
import { getCurrentUserId } from 'state/current-user/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteUserConnections } from 'state/sharing/publicize/selectors';

export const EditorSharingPublicizeServices = ( { connections, post, newConnectionPopup } ) => (
	<ul className="editor-sharing__publicize-services">
		{ map( groupBy( connections, 'label' ), ( groupedConnections, label ) =>
			<li key={ label } className="editor-sharing__publicize-service">
				<h5 className="editor-sharing__publicize-service-heading">{ label }</h5>
				{ groupedConnections.map( ( connection ) =>
					<EditorSharingPublicizeConnection
						key={ connection.ID }
						post={ post }
						connection={ connection }
						onRefresh={ newConnectionPopup } />
				) }
			</li>
		) }
	</ul>
);

EditorSharingPublicizeServices.propTypes = {
	connections: PropTypes.array.isRequired,
	post: PropTypes.object,
	newConnectionPopup: PropTypes.func.isRequired
};

export default connect(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const userId = getCurrentUserId( state );

		return {
			connections: getSiteUserConnections( state, siteId, userId ),
		};
	},
)( EditorSharingPublicizeServices );
