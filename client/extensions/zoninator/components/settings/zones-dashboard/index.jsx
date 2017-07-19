/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import page from 'page';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { find, flowRight, get, trimEnd } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import CompactCard from 'components/card/compact';
import HeaderCake from 'components/header-cake';
import SectionHeader from 'components/section-header';
import sectionsModule from 'sections';
import { getSelectedSiteSlug } from 'state/ui/selectors';

const getZones = () => {
	return [
		{ label: 'Foo', slug: 'foo', description: 'My first zone' },
		{ label: 'Bar', slug: 'bar', description: 'Another zone' },
		{ label: 'Baz', slug: 'baz', description: 'Another zone' },
		{ label: 'Boo', slug: 'boo', description: 'Another zone' },
	];
};

const ZonesDashboard = ( { siteSlug, translate } ) => {
	const getSettingsPath = () => {
		const sections = sectionsModule.get();
		const section = find( sections, ( value => value.name === 'zoninator' ) );

		return get( section, 'settings_path' );
	};

	const handleGoBack = () => {
		page( `/plugins/zoninator/${ siteSlug }` );
	};

	const renderZone = ( { label, slug, description } ) => {
		const path = trimEnd( `${ getSettingsPath() }/${ siteSlug }/${ slug }`, '/' );

		return (
			<CompactCard href={ path } key={ slug }>
				<div className="zones-dashboard__zone-label">{ label }</div>
				<div className="zones-dashboard__zone-description"><small>{ description }</small></div>
			</CompactCard>
		);
	};

	return (
		<div>
			<HeaderCake onClick={ handleGoBack }>
				Zoninator Settings
			</HeaderCake>

			<SectionHeader label={ translate( 'Zones' ) }>
				<Button compact href={ `${ getSettingsPath() }/new/${ siteSlug }` }>
					{ translate( 'Add a zone' ) }
				</Button>
			</SectionHeader>
			{ getZones().map( renderZone ) }
		</div>
	);
};

ZonesDashboard.propTypes = {
	siteSlug: PropTypes.string,
};

const connectComponent = connect( state => {
	return {
		siteSlug: getSelectedSiteSlug( state ),
	};
} );

export default flowRight(
	connectComponent,
	localize,
)( ZonesDashboard );
