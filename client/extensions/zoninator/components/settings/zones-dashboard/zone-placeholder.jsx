/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import CompactCard from 'client/components/card/compact';

const ZonePlaceholder = () => (
	<CompactCard>
		<div className="zones-dashboard__zone-label is-placeholder" />
		<div className="zones-dashboard__zone-description is-placeholder" />
	</CompactCard>
);

export default ZonePlaceholder;
