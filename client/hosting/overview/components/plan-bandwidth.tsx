import React from 'react';
import { convertBytes } from 'calypso/my-sites/backup/backup-contents-page/file-browser/util';
import { useSiteMetricsQuery } from 'calypso/my-sites/site-monitoring/use-metrics-query';
import { useSelector } from 'calypso/state';
import { getSelectedSite } from 'calypso/state/ui/selectors';

interface PlanBandwidthProps {
	children?: React.ReactNode;
	siteId: number;
	className?: string;
}

const getCurrentMonthRangeTimestamps = () => {
	const now = new Date();
	const firstDayOfMonth = new Date( now.getFullYear(), now.getMonth(), 1 );
	const startInSeconds = Math.floor( firstDayOfMonth.getTime() / 1000 );

	const today = new Date();
	const endInSeconds = Math.floor( today.getTime() / 1000 );

	return {
		startInSeconds,
		endInSeconds,
	};
};

export function PlanBandwidth( { siteId }: PlanBandwidthProps ) {
	const selectedSiteData = useSelector( getSelectedSite );
	const selectedSiteDomain = selectedSiteData?.domain;

	const { startInSeconds, endInSeconds } = getCurrentMonthRangeTimestamps();

	const { data } = useSiteMetricsQuery( siteId, {
		start: startInSeconds,
		end: endInSeconds,
		metric: 'response_bytes_persec',
	} );

	if ( ! data || ! selectedSiteDomain ) {
		return;
	}

	const valueInBytes = data.data.periods.reduce(
		( acc, curr ) => acc + ( curr.dimension[ selectedSiteDomain ] || 0 ),
		0
	);

	const { unitAmount, unit } = convertBytes( valueInBytes );

	const startFormatted = new Date( startInSeconds * 1000 ).toLocaleDateString();
	const endFormatted = new Date( endInSeconds * 1000 ).toLocaleDateString();

	return (
		<div>
			<div
				style={ {
					display: 'flex',
					justifyContent: 'space-between',
					padding: '20px 0',
				} }
			>
				<div>Unlimited Bandwidth</div>
				<div title={ 'From ' + startFormatted + ' to ' + endFormatted }>
					{ unitAmount } { unit } used this month
				</div>
			</div>
			Links
		</div>
	);
}
