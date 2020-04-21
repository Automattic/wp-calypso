/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { identity } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import PageViewTracker from 'lib/analytics/page-view-tracker';
import QueryKeyringConnections from 'components/data/query-keyring-connections';
import QueryKeyringServices from 'components/data/query-keyring-services';
import QueryPublicizeConnections from 'components/data/query-publicize-connections';
import SharingServicesGroup from './services-group';

const SharingConnections = ( { translate, expandedService } ) => (
	<div className="connections__sharing-settings connections__sharing-connections">
		<PageViewTracker path="/marketing/connections/:site" title="Marketing > Connections" />
		<QueryKeyringConnections />
		<QueryKeyringServices />
		<QueryPublicizeConnections selectedSite />
		<SharingServicesGroup
			type="publicize"
			title={ translate( 'Publicize Your Posts' ) }
			expandedService={ expandedService }
		/>
		<SharingServicesGroup
			type="other"
			title={ translate( 'Manage Connections' ) }
			expandedService={ expandedService }
		/>
	</div>
);

SharingConnections.propTypes = {
	translate: PropTypes.func,
};

SharingConnections.defaultProps = {
	translate: identity,
};

export default localize( SharingConnections );
