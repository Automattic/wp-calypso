/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import moment from 'moment';

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

	return <div>oops - complete stats might not be available for this period</div>;
};

export default StatsModuleAvailabilityWarning;
