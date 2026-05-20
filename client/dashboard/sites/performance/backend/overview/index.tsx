import { __experimentalVStack as VStack } from '@wordpress/components';
import ChartSlot from './chart-slot';
import SlowRequestsList from './slow-requests-list';
import type { MergedAggregate } from '../aggregate';

export default function Overview( { merged }: { merged: MergedAggregate } ) {
	return (
		<VStack spacing={ 6 }>
			<ChartSlot timeseries={ merged.timeseries } />
			<SlowRequestsList routes={ merged.slowest.routes } />
		</VStack>
	);
}
