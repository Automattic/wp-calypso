import { __experimentalVStack as VStack } from '@wordpress/components';
import ChartSlot from './chart-slot';
import SlowRequestsList from './slow-requests-list';
import type { Site } from '@automattic/api-core';

export default function Overview( { site }: { site: Site } ) {
	return (
		<VStack spacing={ 6 }>
			<ChartSlot />
			<SlowRequestsList site={ site } />
		</VStack>
	);
}
