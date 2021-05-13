/**
 * External dependencies
 */
import React, { FunctionComponent } from 'react';
import { Moment } from 'moment';
import Gridicon from 'calypso/components/gridicon';
import { localize, LocalizeProps } from 'i18n-calypso';

interface Props {
	statType?: string;
	startOfPeriod?: Moment;
}

// File downloads were only recorded from 1st July 2019 onwards,
// so we want to warn the user if the start date is earlier
const fileDownloadsRecordingStartDate = '2019-07-01T00:00:00Z';

const StatsModuleAvailabilityWarning: FunctionComponent< Props & LocalizeProps > = ( {
	statType,
	startOfPeriod,
	translate,
} ) => {
	if ( statType !== 'statsFileDownloads' ) {
		return null;
	}

	if ( ! startOfPeriod || startOfPeriod.isAfter( fileDownloadsRecordingStartDate ) ) {
		return null;
	}

	return (
		<div className="stats-module__availability-warning">
			<Gridicon icon="info-outline" size={ 24 } />
			<p className="stats-module__availability-warning-message">
				{ translate( 'File download counts were not recorded before July 2019.' ) }
			</p>
		</div>
	);
};

export default localize( StatsModuleAvailabilityWarning );
