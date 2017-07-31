/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { find, flowRight, get, noop } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import HeaderCake from 'components/header-cake';
import SectionHeader from 'components/section-header';
import sectionsModule from 'sections';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import QueryZones from '../../data/query-zones';
import Zone from './zone';
import { getZones, isFetchingZones } from '../../../state/zones/selectors';

const ZonesDashboard = ( { siteId, siteSlug, translate, zones } ) => {
	const getSettingsPath = () => {
		const sections = sectionsModule.get();
		const section = find( sections, ( value => value.name === 'zoninator' ) );

		return get( section, 'settings_path' );
	};

	console.log( zones );

	return (
		<div>
			<QueryZones siteId={ siteId } />

			<HeaderCake backHref={ `/plugins/zoninator/${ siteSlug }` } onClick={ noop }>
				Zoninator Settings
			</HeaderCake>

			<SectionHeader label={ translate( 'Zones' ) }>
				<Button compact href={ `${ getSettingsPath() }/new/${ siteSlug }` }>
					{ translate( 'Add a zone' ) }
				</Button>
			</SectionHeader>
			{ zones.map( ( { name, slug, description} ) => (
				<Zone key={ slug } label={ name } slug={ slug } description={ description } />
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
		isFetchingZones: isFetchingZones( state, siteId ),
		siteSlug: getSelectedSiteSlug( state ),
		siteId,
	};
} );

export default flowRight(
	connectComponent,
	localize,
)( ZonesDashboard );
