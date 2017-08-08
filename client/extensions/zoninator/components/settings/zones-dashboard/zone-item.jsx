/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { find, get } from 'lodash';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import sectionsModule from 'sections';
import { getSelectedSiteSlug } from 'state/ui/selectors';

const ZoneItem = ( { siteSlug, zone } ) => {
	const sections = sectionsModule.get();
	const section = find( sections, ( value => value.name === 'zoninator' ) );
	const settingsPath = get( section, 'settings_path' );

	const { slug, name, description } = zone;

	return (
		<CompactCard href={ `${ settingsPath }/${ siteSlug }/${ slug }` }>
			<div className="zones-dashboard__zone-label">{ name }</div>
			<div className="zones-dashboard__zone-description"><small>{ description }</small></div>
		</CompactCard>
	);
};

ZoneItem.propTypes = {
	siteSlug: PropTypes.string,
	zone: PropTypes.object.isRequired,
};

ZoneItem.defaultProps = {
	siteSlug: '',
};

const connectComponent = connect( state => ( {
	siteSlug: getSelectedSiteSlug( state ),
} ) );

export default connectComponent( ZoneItem );
