import { useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { siteApmOverviewQuery } from '../mock-data';
import ResponseTimeChart from './response-time-chart';
import SlowRequestsChart from './slow-requests-chart';
import ThroughputChart from './throughput-chart';
import type { Site } from '@automattic/api-core';

export default function Overview( { site }: { site: Site } ) {
	const { data } = useSuspenseQuery( siteApmOverviewQuery( site.ID ) );

	return (
		<VStack spacing={ 6 }>
			<ResponseTimeChart timeseries={ data.timeseries } />
			<ThroughputChart timeseries={ data.timeseries } />
			<SlowRequestsChart site={ site } slowRequests={ data.slow_requests } />
		</VStack>
	);
}
