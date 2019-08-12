/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import moment from 'moment';
import Gridicon from 'gridicons';

interface Props {
	statType?: string;
	startOfPeriod?: moment.Moment;
}

// File downloads were only recorded from 28th June 2019 onwards,
// so we want to warn the user if the start date is earlier
const fileDownloadsRecordingStartDate = '2019-06-29T00:00:00Z';

const StatsModuleAvailabilityWarning: FunctionComponent< Props > = ( {
	statType,
	startOfPeriod,
} ) => {
	if ( statType !== 'statsFileDownloads' ) {
		return null;
	}

	if ( ! startOfPeriod || startOfPeriod.isAfter( fileDownloadsRecordingStartDate ) ) {
		return null;
	}

	return (
		<div className="stats-module__availability-warning">
			<Gridicon icon="info-outline" size="18" /> info info info
		</div>
	);
};

export default StatsModuleAvailabilityWarning;
