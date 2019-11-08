/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { identity } from 'lodash';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import PageViewTracker from 'lib/analytics/page-view-tracker';
import QueryKeyringConnections from 'components/data/query-keyring-connections';
import QuerySiteKeyrings from 'components/data/query-site-keyrings';
import QueryKeyringServices from 'components/data/query-keyring-services';
import QueryPublicizeConnections from 'components/data/query-publicize-connections';
import SharingServicesGroup from './services-group';
import { getSelectedSiteId } from 'state/ui/selectors';

const SharingConnections = ( { translate, siteId } ) => (
	<div className="connections__sharing-settings connections__sharing-connections">
		<PageViewTracker path="/marketing/connections/:site" title="Marketing > Connections" />
		<QueryKeyringConnections />
		<QuerySiteKeyrings siteId={ siteId } />
		<QueryKeyringServices />
		<QueryPublicizeConnections selectedSite />
		<SharingServicesGroup type="publicize" title={ translate( 'Publicize Your Posts' ) } />
		<SharingServicesGroup type="other" title={ translate( 'Manage Connections' ) } />
	</div>
);

SharingConnections.propTypes = {
	translate: PropTypes.func,
};

SharingConnections.defaultProps = {
	translate: identity,
};

export default connect( state => ( {
	siteId: getSelectedSiteId( state ),
} ) )( localize( SharingConnections ) );
