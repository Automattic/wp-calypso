import { siteApmAggregateQuery } from '@automattic/api-queries';
import { useSuspenseQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack } from '@wordpress/components';
import { useMemo } from 'react';
import { mergeAggregates } from '../aggregate';
import ChartSlot from './chart-slot';
import SlowRequestsList from './slow-requests-list';
import type { Site } from '@automattic/api-core';

export default function Overview( { site }: { site: Site } ) {
	const { data } = useSuspenseQuery( siteApmAggregateQuery( site.ID ) );

	const merged = useMemo( () => mergeAggregates( data.aggregates ), [ data.aggregates ] );

	return (
		<VStack spacing={ 6 }>
			<ChartSlot timeseries={ merged.timeseries } />
			<SlowRequestsList routes={ merged.slowest.routes } />
		</VStack>
	);
}
