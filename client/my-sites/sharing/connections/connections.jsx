/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { identity } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import QueryKeyringConnections from 'components/data/query-keyring-connections';
import QueryKeyringServices from 'components/data/query-keyring-services';
import QueryPublicizeConnections from 'components/data/query-publicize-connections';
import SharingServicesGroup from './services-group';

const SharingConnections = ( { connections, translate } ) => (
	<div className="sharing-settings sharing-connections">
		<QueryKeyringConnections />
		<QueryKeyringServices />
		<QueryPublicizeConnections selectedSite />
		<SharingServicesGroup
			type="publicize"
			title={ translate( 'Publicize Your Posts' ) }
			connections={ connections } />
		<SharingServicesGroup
			type="other"
			title={ translate( 'Other Connections' ) }
			connections={ connections } />
	</div>
);

SharingConnections.propTypes = {
	connections: PropTypes.object,
	translate: PropTypes.func,
};

SharingConnections.defaultProps = {
	connections: {},
	translate: identity,
};

export default localize( SharingConnections );
