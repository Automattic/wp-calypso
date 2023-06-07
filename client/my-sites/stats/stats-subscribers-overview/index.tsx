import { CountComparisonCard } from '@automattic/components';
import { translate } from 'i18n-calypso';
import React from 'react';
import {
	useSubscribersQueries,
	SubscribersData,
} from 'calypso/my-sites/stats/hooks/use-subscribers-query';

import './style.scss';

// array of indices to use to calculate the dates to query for
const cardIndices = [ 0, 30, 60, 90 ];

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
function SubscribersOverviewCardStats( subscribersData: SubscribersData[] ) {
	const getCount = ( index: number ) => {
		return subscribersData[ index ]?.data?.[ 0 ]?.subscribers || 0;
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

<<<<<<< HEAD
	const { isLoading, isError, subscribersData } = useSubscribersQueries(
		siteId,
		period,
		quantity,
		dates
	);
=======
<<<<<<< HEAD
	const isLoading = subscribersQueries.some( ( result ) => result.isLoading );
	const isError = subscribersQueries.some( ( result ) => result.isError );
	const subscribersData = subscribersQueries.map( ( result ) => result.data?.data || [] );
>>>>>>> d97a8b8aa8 (handle errors and loading status separately)

	const overviewCardStats = SubscribersOverviewCardStats( subscribersData );
=======
	const subscribersQueries = useSubscribersQueries( siteId, period, quantity, dates );
>>>>>>> 37a7f330e2 (handle errors and loading status separately)

	return (
<<<<<<< HEAD
		<div className="stats-subscribers-overview highlight-cards">
			{ isLoading && <div>Loading...</div> }
			{ isError && <div>Error: Failed to load data.</div> }
			{ ! isLoading && ! isError && (
				<div className="highlight-cards-list">
					{ overviewCardStats.map( ( overviewCardStat ) => (
=======
		<div className="subscribers-overview highlight-cards">
			<div className="highlight-cards-list">
				{ subscribersQueries.map( ( result, index ) => {
					if ( result.isLoading ) {
						return <div key={ index }>Loading...</div>;
					}

					if ( result.isError ) {
						return <div key={ index }>Error: Failed to load data.</div>;
					}

					const subscribersData = result.data;
					const overviewCardStat = SubscribersOverviewCardStats( [ subscribersData ] )[ 0 ];

					return (
>>>>>>> d97a8b8aa8 (handle errors and loading status separately)
						<CountComparisonCard
							key={ overviewCardStat.count }
							heading={ overviewCardStat.heading }
							count={ overviewCardStat.count ? parseInt( String( overviewCardStat.count ) ) : null }
							showValueTooltip
							icon={ false }
						/>
					);
				} ) }
			</div>
		</div>
	);
};

export default SubscribersOverview;
