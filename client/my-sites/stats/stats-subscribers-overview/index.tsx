import { Spinner } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import CountCard from 'calypso/my-sites/stats/components/highlight-cards/count-card';
import StatsError from 'calypso/my-sites/stats/stats-error';
import useSubscribersOverview from 'calypso/my-sites/stats/hooks/use-subscribers-overview';

interface SubscribersOverviewProps {
	siteId: number | null;
}

const SubscribersOverview: React.FC< SubscribersOverviewProps > = ( { siteId } ) => {
	const { isLoading, isError, overviewData } = useSubscribersOverview( siteId );
	const translate = useTranslate();
	const showSpinner = isLoading && overviewData.length === 0;

	return (
		<div className="subscribers-overview highlight-cards">
			<div className="highlight-cards-list">
				{ showSpinner && <Spinner /> }
				{ overviewData.map( ( { count, heading, note }, index ) => {
					return (
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
			{ isError && ! isLoading && <StatsError /> }
		</div>
	);
};

export default SubscribersOverview;
