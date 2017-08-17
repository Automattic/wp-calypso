/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import { settingsPath } from '../../../app/util';

const ZoneItem = ( { siteSlug, zone } ) => {
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
