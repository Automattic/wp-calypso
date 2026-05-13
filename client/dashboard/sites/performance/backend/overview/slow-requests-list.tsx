import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useState } from 'react';
import { Card, CardBody, CardHeader } from '../../../../components/card';
import { Text } from '../../../../components/text';
import BarList, { type BarListRow } from '../bar-list';
import { formatMs } from '../utils';
import type { ApmSlowRequest } from '@automattic/api-core';

type Metric = 'avg' | 'max';

function toRows( requests: ApmSlowRequest[], metric: Metric ): BarListRow[] {
	return requests.map( ( request ) => ( {
		id: request.id,
		label: `${ request.method } ${ request.url }`,
		value: metric === 'avg' ? request.avg_duration_ms : request.duration_ms,
	} ) );
}

function pickHeadlineDuration( requests: ApmSlowRequest[], metric: Metric ): number {
	if ( ! requests.length ) {
		return 0;
	}
	if ( metric === 'avg' ) {
		const total = requests.reduce( ( sum, r ) => sum + r.avg_duration_ms, 0 );
		return Math.round( total / requests.length );
	}
	return requests.reduce( ( max, r ) => Math.max( max, r.duration_ms ), 0 );
}

export default function SlowRequestsList( { slowRequests }: { slowRequests: ApmSlowRequest[] } ) {
	const [ metric, setMetric ] = useState< Metric >( 'max' );

	const rows = toRows( slowRequests, metric );
	const headline = pickHeadlineDuration( slowRequests, metric );

	const description =
		metric === 'avg'
			? __( 'Average response time across the slowest endpoints in the selected period.' )
			: __( 'Slowest single response observed across these endpoints in the selected period.' );

	return (
		<Card>
			<CardHeader>
				<HStack wrap spacing={ 4 } justify="space-between" alignment="flex-start">
					<VStack spacing={ 2 } alignment="flex-start">
						<Text size="title" weight={ 500 } as="h2">
							{ __( 'Slowest requests' ) }
						</Text>
						<Text size={ 32 } weight={ 500 } lineHeight="40px">
							{ formatMs( headline ) }
						</Text>
						<Text variant="muted">{ description }</Text>
					</VStack>
					<ToggleGroupControl
						value={ metric }
						isBlock
						__nextHasNoMarginBottom
						__next40pxDefaultSize
						onChange={ ( value ) => setMetric( ( value as Metric ) ?? 'max' ) }
						label={ __( 'Duration metric' ) }
						hideLabelFromVision
					>
						<ToggleGroupControlOption value="avg" label={ __( 'Avg' ) } />
						<ToggleGroupControlOption value="max" label={ __( 'Max' ) } />
					</ToggleGroupControl>
				</HStack>
			</CardHeader>
			<CardBody>
				<BarList rows={ rows } valueFormatter={ formatMs } />
			</CardBody>
		</Card>
	);
}
