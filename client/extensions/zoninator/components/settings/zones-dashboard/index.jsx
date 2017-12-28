/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { flowRight, times } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'client/components/button';
import HeaderCake from 'client/components/header-cake';
import SectionHeader from 'client/components/section-header';
import { getSelectedSiteId, getSelectedSiteSlug } from 'client/state/ui/selectors';
import ZoneItem from './zone-item';
import ZonePlaceholder from './zone-placeholder';
import { getZones, isRequestingZones } from '../../../state/zones/selectors';
import { settingsPath } from '../../../app/util';

const placeholderCount = 5;

const ZonesDashboard = ( { isRequesting, siteSlug, translate, zones } ) => (
	<div>
		<HeaderCake backHref={ `/plugins/zoninator/${ siteSlug }` }>Zoninator Settings</HeaderCake>

		<SectionHeader label={ translate( 'Zones' ) }>
			<Button compact href={ `${ settingsPath }/new/${ siteSlug }` }>
				{ translate( 'Add a zone' ) }
			</Button>
		</SectionHeader>
		{ isRequesting &&
			zones.length === 0 &&
			times( placeholderCount, i => <ZonePlaceholder key={ i } /> ) }
		{ zones.map( zone => <ZoneItem key={ zone.slug } zone={ zone } /> ) }
	</div>
);

ZonesDashboard.propTypes = {
	siteSlug: PropTypes.string,
	zones: PropTypes.array,
};

const connectComponent = connect( state => {
	const siteId = getSelectedSiteId( state );

	return {
		zones: getZones( state, siteId ),
		isRequesting: isRequestingZones( state, siteId ),
		siteSlug: getSelectedSiteSlug( state ),
	};
} );

export default flowRight( connectComponent, localize )( ZonesDashboard );
