import { CountComparisonCard } from '@automattic/components';
import { UseQueryResult, useQueries } from '@tanstack/react-query';
import { translate } from 'i18n-calypso';
import React from 'react';
import {
	querySubscribers,
	selectSubscribers,
} from 'calypso/my-sites/stats/hooks/use-subscribers-query';

// array of indices to use to calculate the dates to query for
const cardIndices = [ 0, 30, 60, 90 ];

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
	siteId: number | null;
}

// calculate the date to query for based on the number of days to subtract
function calculateQueryDate( daysToSubtract: number ) {
	const today = new Date();
	const date = new Date( today );
	date.setDate( date.getDate() - daysToSubtract );
	return date.toISOString().split( 'T' )[ 0 ];
}

// calculate the stats to display in the cards
function SubscribersOverviewCardStats( subscribersDataArrays: SubscribersData[][] ) {
	const getCount = ( index: number ) => {
		return subscribersDataArrays[ index ]?.[ 0 ]?.subscribers || 0;
	};

	const overviewCardStats = [
		{
			heading: translate( 'Today' ),
			count: getCount( 0 ),
		},
		{
			heading: translate( '30 days ago' ),
			count: getCount( 1 ),
		},
		{
			heading: translate( '60 days ago' ),
			count: getCount( 2 ),
		},
		{
			heading: translate( '90 days ago' ),
			count: getCount( 3 ),
		},
	];

	return overviewCardStats;
}

const SubscribersOverview: React.FC< SubscribersOverviewProps > = ( { siteId } ) => {
	const period = 'day';
	const quantity = 1;
	const dates = cardIndices.map( calculateQueryDate );
	const subscribersQueries = useQueries( {
		queries: dates.map( ( date ) => ( {
			queryKey: [ 'stats', 'subscribers', siteId, period, quantity, date ],
			queryFn: () => querySubscribers( siteId, period, quantity, date ),
			select: selectSubscribers,
			staleTime: 1000 * 60 * 5, // 5 minutes
		} ) ),
	} ) as UseQueryResult< SubscribersDataResult >[];

	const isLoading = subscribersQueries.some( ( result ) => result.isLoading );
	const isError = subscribersQueries.some( ( result ) => result.isError );
	const subscribersData = subscribersQueries.map( ( result ) => result.data?.data || [] );

	const overviewCardStats = SubscribersOverviewCardStats( subscribersData );

	return (
		<div className="subscribers-overview highlight-cards">
			{ isLoading && <div>Loading...</div> }
			{ isError && <div>Error: Failed to load data.</div> }
			{ ! isLoading && ! isError && (
				<div className="highlight-cards-list">
					{ overviewCardStats.map( ( overviewCardStat ) => (
						<CountComparisonCard
							key={ overviewCardStat.count }
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
