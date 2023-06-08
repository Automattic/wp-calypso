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
	function SubscribersOverviewCardStats( subscribersData: SubscribersData, index: number ) {
		const getCount = () => {
			return subscribersData?.data?.[ 0 ]?.subscribers || 0;
		};

	let heading;
	switch ( index ) {
		case 0:
			heading = translate( 'Today' );
			break;
		case 1:
			heading = translate( '30 days ago' );
			break;
		case 2:
			heading = translate( '60 days ago' );
			break;
		case 3:
			heading = translate( '90 days ago' );
			break;
		default:
			heading = '';
			break;
	}

	const overviewCardStat = {
		heading,
		count: getCount(),
	};

	return overviewCardStat;
}

const SubscribersOverview: React.FC< SubscribersOverviewProps > = ( { siteId } ) => {
	const period = 'day';
	const quantity = 1;
	const dates = cardIndices.map( calculateQueryDate );

	const { isLoading, isError, subscribersData } = useSubscribersQueries(
		siteId,
		period,
		quantity,
		dates
	);

	const subscribersQueries = useSubscribersQueries( siteId, period, quantity, dates );

	return (
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
					const overviewCardStat = getCountComparisonCardProps( result.data, index );

					return (
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
