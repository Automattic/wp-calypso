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

const Zone = ( { siteSlug, label, slug, description } ) => {
	const getSettingsPath = () => {
		const sections = sectionsModule.get();
		const section = find( sections, ( value => value.name === 'zoninator' ) );

		return get( section, 'settings_path' );
	};

	return (
		<CompactCard href={ `${ getSettingsPath() }/${ siteSlug }/${ slug }` }>
			<div className="zones-dashboard__zone-label">{ label }</div>
			<div className="zones-dashboard__zone-description"><small>{ description }</small></div>
		</CompactCard>
	);
};

Zone.propTypes = {
	siteSlug: PropTypes.string,
	label: PropTypes.string,
	slug: PropTypes.string,
	description: PropTypes.string,
};

Zone.defaultProps = {
	siteSlug: '',
	label: '',
	slug: '',
	description: '',
};

const connectComponent = connect( state => {
	return {
		siteSlug: getSelectedSiteSlug( state ),
	};
} );

export default connectComponent( Zone );
