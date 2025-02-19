import { CountCard } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import useSubscribersOverview from 'calypso/my-sites/stats/hooks/use-subscribers-overview';

interface SubscribersOverviewProps {
	siteId: number | null;
}

const SubscribersOverview: React.FC< SubscribersOverviewProps > = ( { siteId } ) => {
	const { isLoading, isError, overviewData } = useSubscribersOverview( siteId );
	const translate = useTranslate();

	return (
		<div className="subscribers-overview highlight-cards">
			<div className="highlight-cards-list">
				{ overviewData.map( ( { count, heading, note }, index ) => {
					return (
						// TODO: Communicate loading vs error state to the user.
						<CountCard
							key={ index }
							heading={ heading }
							label={ translate( 'subscribers' ) }
							note={ note }
							value={ isLoading || isError ? null : count }
							showValueTooltip
						/>
					);
				} ) }
			</div>
		</div>
	);
};

export default SubscribersOverview;
