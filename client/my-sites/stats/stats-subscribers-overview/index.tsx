import { CountComparisonCard } from '@automattic/components';
import { UseQueryResult, useQueries } from '@tanstack/react-query';
import { translate } from 'i18n-calypso';
import React from 'react';
import {
	querySubscribers,
	selectSubscribers,
} from 'calypso/my-sites/stats/hooks/use-subscribers-query';

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

// calculate the dates to query for
const dateToday = calculateQueryDate( indexFirstCard );
const date30DaysAgo = calculateQueryDate( indexSecondCard );
const date60DaysAgo = calculateQueryDate( indexThirdCard );
const date90DaysAgo = calculateQueryDate( indexFourthCard );

// calculate the date to query for based on the number of days to subtract
// todo: move to a utils file
function calculateQueryDate( daysToSubtract: number ) {
	const today = new Date();
	const date = new Date( today );
	date.setDate( date.getDate() - daysToSubtract );
	return date.toISOString().split( 'T' )[ 0 ];
}

// all comparisons are being compared to todays's count to show growth up to today
function SubscribersOverviewCardStats( subscribersData: SubscribersData[][] ) {
	const subscribersNumbersArray: number[] = subscribersData.map( ( innerArray ) => {
		if ( Array.isArray( innerArray ) && innerArray.length > 0 ) {
			return innerArray[ 0 ].subscribers;
		}
		return 0;
	} );
	const daysToDisplay = [ indexFirstCard, indexSecondCard, indexThirdCard, indexFourthCard ];
	const overviewCardStats: {
		heading: string;
		count: number;
		previousCount?: number;
	}[] = [];

	daysToDisplay.forEach( ( day, index ) => {
		const count = subscribersNumbersArray[ index ] || 0;

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

const SubscribersOverview: React.FC< SubscribersOverviewProps > = ( { siteId } ) => {
	const period = 'day';
	const quantity = 1;
	const dates: string[] = [ dateToday, date30DaysAgo, date60DaysAgo, date90DaysAgo ];
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
