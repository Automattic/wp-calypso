import { CountComparisonCard } from '@automattic/components';
import { translate } from 'i18n-calypso';
import React from 'react';

function SubscribersOverviewCardStats() {
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
	return overviewCardStats;
}

function SubscribersOverviewCards() {
	const overviewCardStats = SubscribersOverviewCardStats();

	return (
		<div className="overview-cards-list">
			{ overviewCardStats.map( ( overviewCardStat ) => (
				<CountComparisonCard
					key={ overviewCardStat.heading }
					heading={ overviewCardStat.heading }
					count={ overviewCardStat.count }
					previousCount={ overviewCardStat.previousCount }
					showValueTooltip
<<<<<<< HEAD
					icon={ false }
=======
					icon="False"
>>>>>>> 096c321e9e (udate location of component)
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
}

export default SubscribersOverview;
