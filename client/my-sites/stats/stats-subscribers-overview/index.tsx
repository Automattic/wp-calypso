import { CountComparisonCard } from '@automattic/components';
import { translate } from 'i18n-calypso';
import React from 'react';

interface SubscribersOverviewProps {
	siteID: number;
}

<<<<<<< HEAD
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

const SubscribersOverview: React.FC< SubscribersOverviewProps > = ( { siteID } ) => {
	const overviewCardStats = SubscribersOverviewCardStats( siteID );
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
=======
function extractCountsAtIndexes( subscribersData: SubscribersData[], indexes: number[] ): number[] {
	return indexes.map( ( index ) => subscribersData[ index ]?.subscribers || 0 );
}

// all comparisons are being compared to todays's count to show growth up to today
function SubscribersOverviewCardStats( subscribersData: number[] ) {
	const daysToDisplay = [ 0, 30, 60, 90 ];
	const dataToDisplay = subscribersData;
	const overviewCardStats: {
		heading: string;
		count: number;
		previousCount?: number;
	}[] = [];

	const todayCount = dataToDisplay[ 0 ] || 0;

	daysToDisplay.forEach( ( day, index ) => {
		const count = dataToDisplay[ index ] || 0;
		const previousCount = index !== 0 ? todayCount - dataToDisplay[ index - 1 ] : undefined;

		const cardStat = {
			heading: ( index === 0
				? translate( 'Today' )
				: translate( '%d days ago', { args: day } ) ) as string,
			count: count,
			previousCount: previousCount,
		};

		overviewCardStats.push( cardStat );
	} );

	return overviewCardStats;
}

// query for 90 days at once, then use a function to break it down.
const SubscribersOverview: React.FC< SubscribersOverviewProps > = ( { siteId } ) => {
	const period = 'day';
	const quantity = 90;
	const { isLoading, isError, data } = useSubscribersQuery(
		siteId,
		period,
		quantity
	) as UseQueryResult< SubscribersDataResult >;

	const subscribersData = data?.data || [];
	const indexesToExtract = [ 0, 29, 59, 89 ]; // get out today, 30 days, 60 days, 90 days
	const extractedCounts = extractCountsAtIndexes( subscribersData, indexesToExtract );

	// use 'extractedCounts' to get out just the dates we want from the data
	const overviewCardStats = SubscribersOverviewCardStats( extractedCounts );

	return (
		<div className="subscribers-overview highlight-cards">
			{ isLoading && <div>Loading...</div> }
			{ isError && <div>Error: Failed to load data.</div> }
			{ ! isLoading && ! isError && (
				<div className="highlight-cards-list">
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
			) }
>>>>>>> f7b4867265 (Pass data to cards + fix i88n issue)
		</div>
	);
};

function SubscribersOverview() {
	return (
		<div className="subscribers-overview">
			<SubscribersOverviewCards />
		</div>
	);
}

export default SubscribersOverview;
