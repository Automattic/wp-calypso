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
import Zone from './zone';
import Button from 'components/button';
import HeaderCake from 'components/header-cake';
import SectionHeader from 'components/section-header';
import sectionsModule from 'sections';
import { getSelectedSiteSlug } from 'state/ui/selectors';

const zones = [
	{ label: 'Foo', slug: 'foo', description: 'My first zone' },
	{ label: 'Bar', slug: 'bar', description: 'Another zone' },
	{ label: 'Baz', slug: 'baz', description: 'Another zone' },
	{ label: 'Boo', slug: 'boo', description: 'Another zone' },
];

const ZonesDashboard = ( { siteSlug, translate } ) => {
	const getSettingsPath = () => {
		const sections = sectionsModule.get();
		const section = find( sections, ( value => value.name === 'zoninator' ) );

		return get( section, 'settings_path' );
	};

	return (
		<div>
			<HeaderCake backHref={ `/plugins/zoninator/${ siteSlug }` } onClick={ noop }>
				Zoninator Settings
			</HeaderCake>

			<SectionHeader label={ translate( 'Zones' ) }>
				<Button compact href={ `${ getSettingsPath() }/new/${ siteSlug }` }>
					{ translate( 'Add a zone' ) }
				</Button>
			</SectionHeader>
			{ zones.map( ( { label, slug, description } ) => (
					<Zone key={ slug } label={ label } slug={ slug } description={ description } />
				) ) }
		</div>
	);
};

ZonesDashboard.propTypes = {
	siteSlug: PropTypes.string,
};

const connectComponent = connect( state => ( {
	siteSlug: getSelectedSiteSlug( state ),
} ) );

export default flowRight(
	connectComponent,
	localize,
)( ZonesDashboard );
