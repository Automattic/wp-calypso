/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';

const ZonePlaceholder = () => (
	<CompactCard>
		<div className="zones-dashboard__zone-label is-placeholder"></div>
		<div className="zones-dashboard__zone-description is-placeholder"></div>
	</CompactCard>
);

export default ZonePlaceholder;
