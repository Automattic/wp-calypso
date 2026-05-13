import { BarListChart, GlobalChartsProvider, type SeriesData } from '@automattic/charts';
import { useRouter } from '@tanstack/react-router';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
	Button,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { useState } from 'react';
import { Card, CardBody, CardHeader, CardFooter } from '../../../../components/card';
import { Text } from '../../../../components/text';
import type { ApmSlowRequest, Site } from '@automattic/api-core';

import '@automattic/charts/style.css';

type Metric = 'avg' | 'max';
const CHART_ID = 'apm-slow-requests';

function formatDuration( ms: number ): string {
	if ( ms >= 1000 ) {
		return sprintf(
			/* translators: %s is a number of seconds. */
			__( '%s s' ),
			( ms / 1000 ).toFixed( 2 )
		);
	}
	return sprintf(
		/* translators: %d is a number of milliseconds. */
		__( '%d ms' ),
		ms
	);
}

function toSeriesData( requests: ApmSlowRequest[], metric: Metric ): SeriesData[] {
	return [
		{
			label: metric === 'avg' ? __( 'Average' ) : __( 'Max' ),
			data: requests.map( ( request ) => ( {
				label: `${ request.method } ${ request.url }`,
				value: metric === 'avg' ? request.avg_duration_ms : request.duration_ms,
			} ) ),
		},
	];
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

export default function SlowRequestsList( {
	site,
	slowRequests,
}: {
	site: Site;
	slowRequests: ApmSlowRequest[];
} ) {
	const router = useRouter();
	const [ metric, setMetric ] = useState< Metric >( 'max' );

	const data = toSeriesData( slowRequests, metric );
	const headline = pickHeadlineDuration( slowRequests, metric );
	const height = Math.max( 240, slowRequests.length * 36 );

	const viewAllRequests = () => {
		router.navigate( {
			to: `/sites/${ site.slug }/performance/backend/requests`,
		} );
	};

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
							{ formatDuration( headline ) }
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
				<GlobalChartsProvider>
					<BarListChart
						chartId={ CHART_ID }
						data={ data }
						height={ height }
						withTooltips
						options={ {
							yScale: {},
							xScale: {},
							valueFormatter: formatDuration,
						} }
					/>
				</GlobalChartsProvider>
			</CardBody>
			<CardFooter>
				<Button variant="secondary" onClick={ viewAllRequests }>
					{ __( 'View all requests' ) }
				</Button>
			</CardFooter>
		</Card>
	);
}
