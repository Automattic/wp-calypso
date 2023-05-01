import { CountComparisonCard } from '@automattic/components';
import { translate } from 'i18n-calypso';
import React from 'react';

interface SubscribersOverviewProps {
	siteID: number;
}

function SubscribersOverviewCardStats( siteID: number ) {
	const overviewCardStats = [
		{
			heading: translate( 'Today' ),
			count: 1410,
		},
		{
			heading: translate( '30 days ago' ),
			count: 1080,
			previousCount: 1080,
		},
		{
			heading: translate( '60 days ago' ),
			count: 1000,
			previousCount: 1080,
		},
		{
			heading: translate( '90 days ago' ),
			count: 970,
			previousCount: 1080,
		},
	];
	// Use siteID to fetch or filter data if needed
	return overviewCardStats;
}

<<<<<<< HEAD
function SubscribersOverviewCards() {
	const overviewCardStats = SubscribersOverviewCardStats();

=======
const SubscribersOverview: React.FC< SubscribersOverviewProps > = ( { siteID } ) => {
	const overviewCardStats = SubscribersOverviewCardStats( siteID );
>>>>>>> 1b418f8163 (pass siteID to overview)
	return (
		<div className="overview-cards-list">
			{ overviewCardStats.map( ( overviewCardStat ) => (
				<CountComparisonCard
					key={ overviewCardStat.heading }
					heading={ overviewCardStat.heading }
					count={ overviewCardStat.count }
					previousCount={ overviewCardStat.previousCount }
					showValueTooltip
					icon={ false }
				/>
			) ) }
		</div>
	);
}

function SubscribersOverview() {
	return (
		<div className="subscribers-overview">
			<SubscribersOverviewCards />
		</div>
	);
};

export default SubscribersOverview;
