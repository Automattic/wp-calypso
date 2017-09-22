/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { identity } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

/**
 * Internal dependencies
 */
import SharingServicesGroup from './services-group';
import QueryKeyringConnections from 'components/data/query-keyring-connections';
import QueryKeyringServices from 'components/data/query-keyring-services';
import QueryPublicizeConnections from 'components/data/query-publicize-connections';

const SharingConnections = ( { translate } ) => (
	<div className="sharing-settings sharing-connections">
		<QueryKeyringConnections />
		<QueryKeyringServices />
		<QueryPublicizeConnections selectedSite />
		<SharingServicesGroup type="publicize" title={ translate( 'Publicize Your Posts' ) } />
		<SharingServicesGroup type="other" title={ translate( 'Other Connections' ) } />
	</div>
);

SharingConnections.propTypes = {
	translate: PropTypes.func,
};

SharingConnections.defaultProps = {
	translate: identity,
};

export default localize( SharingConnections );
