import { CountComparisonCard } from '@automattic/components';
import { UseQueryResult } from '@tanstack/react-query';
import { translate } from 'i18n-calypso';
import React from 'react';
import useSubscribersQuery from 'calypso/my-sites/stats/hooks/use-subscribers-query';

const indexFirstCard = 0; // 0 for today
const indexSecondCard = 30; // 30 days out
const indexThirdCard = 60; // 60 days out
const indexFourthCard = 90; // 90 days out

interface SubscribersData {
	period: string;
	subscribers: number;
	subscribers_change: number;
}

interface SubscribersDataResult {
	data: SubscribersData[];
	unit: string;
	date: string;
}

interface SubscribersOverviewProps {
	siteId: number;
}

function extractCountsAtIndexes( subscribersData: SubscribersData[], indexes: number[] ): number[] {
	return indexes.map(
		( index ) =>
			( index > 0
				? subscribersData[ index - 1 ]?.subscribers
				: subscribersData[ index ]?.subscribers ) || 0
	);
}

// all comparisons are being compared to todays's count to show growth up to today
function SubscribersOverviewCardStats( subscribersData: number[] ) {
	const daysToDisplay = [ indexFirstCard, indexSecondCard, indexThirdCard, indexFourthCard ];
	const overviewCardStats: {
		heading: string;
		count: number;
		previousCount?: number;
	}[] = [];

	daysToDisplay.forEach( ( day, index ) => {
		const count = subscribersData[ index ] || 0;

		const cardStat = {
			heading: ( index === 0
				? translate( 'Today' )
				: translate( '%d days ago', { args: day } ) ) as string,
			count: count,
		};

		overviewCardStats.push( cardStat );
	} );

	return overviewCardStats;
}

// query for 90 days at once, then use a function to break it down.
const SubscribersOverview: React.FC< SubscribersOverviewProps > = ( { siteId } ) => {
	const period = 'day';
	const quantity = indexFourthCard;
	const date = '2023-03-01';
	const { isLoading, isError, data } = useSubscribersQuery(
		siteId,
		period,
		quantity,
		date
	) as UseQueryResult< SubscribersDataResult >;

	const subscribersData = data?.data || [];

	const indexesToExtract = [ indexFirstCard, indexSecondCard, indexThirdCard, indexFourthCard ]; // get out today, 30 days, 60 days, 90 days
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
							showValueTooltip
							icon={ false }
						/>
					) ) }
				</div>
			) }
		</div>
	);
};

export default SubscribersOverview;
