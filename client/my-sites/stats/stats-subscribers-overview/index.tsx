import { CountComparisonCard } from '@automattic/components';
import React from 'react';
import useSubscribersOverview from 'calypso/my-sites/stats/hooks/use-subscribers-overview';

interface SubscribersOverviewProps {
	siteId: number | null;
}

const SubscribersOverview: React.FC< SubscribersOverviewProps > = ( { siteId } ) => {
	const { isLoading, isError, overviewData } = useSubscribersOverview( siteId );

	return (
		<div className="subscribers-overview highlight-cards">
			<div className="highlight-cards-list">
				{ overviewData.map( ( { count, label }, index ) => {
					return (
						// TODO: Communicate loading vs error state to the user.
						<CountComparisonCard
							key={ index }
							heading={ label }
							count={ isLoading || isError ? null : count }
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
