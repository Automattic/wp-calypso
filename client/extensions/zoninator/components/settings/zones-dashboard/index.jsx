/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { find, flowRight, get, range } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import HeaderCake from 'components/header-cake';
import SectionHeader from 'components/section-header';
import sectionsModule from 'sections';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import QueryZones from '../../data/query-zones';
import ZoneItem from './zone-item';
import ZonePlaceholder from './zone-placeholder';
import { getZones, isFetchingZones } from '../../../state/zones/selectors';

const placeholderCount = 16;

const ZonesDashboard = ( { isFetching, siteId, siteSlug, translate, zones } ) => {
	const sections = sectionsModule.get();
	const section = find( sections, ( value => value.name === 'zoninator' ) );
	const settingsPath = get( section, 'settings_path' );

	return (
		<div>
			<QueryZones siteId={ siteId } />

			<HeaderCake backHref={ `/plugins/zoninator/${ siteSlug }` }>
				Zoninator Settings
			</HeaderCake>

			<SectionHeader label={ translate( 'Zones' ) }>
				<Button compact href={ `${ settingsPath }/new/${ siteSlug }` }>
					{ translate( 'Add a zone' ) }
				</Button>
			</SectionHeader>
			{ isFetching && zones.length === 0 && range( placeholderCount ).map( i => (
				<ZonePlaceholder key={ i } />
			) ) }
			{ zones.map( ( zone, idx ) => (
				<ZoneItem key={ idx } zone={ zone } />
			) ) }
		</div>
	);
};

ZonesDashboard.propTypes = {
	siteSlug: PropTypes.string,
	zones: PropTypes.array,
};

const connectComponent = connect( state => {
	const siteId = getSelectedSiteId( state );

	return {
		zones: getZones( state, siteId ),
		isFetching: isFetchingZones( state, siteId ),
		siteSlug: getSelectedSiteSlug( state ),
		siteId,
	};
} );

export default flowRight(
	connectComponent,
	localize,
)( ZonesDashboard );
