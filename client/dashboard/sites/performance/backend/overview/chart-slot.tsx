import { AreaChart, GlobalChartsProvider, type SeriesData } from '@automattic/charts';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Card, CardBody, CardHeader } from '../../../../components/card';
import { Text } from '../../../../components/text';
import type { ApmTimePoint } from '@automattic/api-core';

import '@automattic/charts/style.css';

const CHART_ID = 'apm-response-time-breakdown';

const SERIES: Array< { key: keyof Omit< ApmTimePoint, 'timestamp' >; label: string } > = [
	{ key: 'db', label: __( 'Database' ) },
	{ key: 'wp_core', label: __( 'WordPress core' ) },
	{ key: 'plugins', label: __( 'Plugins' ) },
	{ key: 'external', label: __( 'External' ) },
	{ key: 'cache', label: __( 'Cache' ) },
];

function toSeriesData( timeseries: ApmTimePoint[] ): SeriesData[] {
	return SERIES.map( ( { key, label } ) => ( {
		label,
		data: timeseries.map( ( point ) => ( {
			date: new Date( point.timestamp ),
			value: point[ key ],
		} ) ),
	} ) );
}

function formatMs( ms: number ): string {
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

function getAverageTotal( timeseries: ApmTimePoint[] ): number {
	if ( ! timeseries.length ) {
		return 0;
	}
	const total = timeseries.reduce(
		( sum, point ) => sum + point.db + point.wp_core + point.plugins + point.external + point.cache,
		0
	);
	return Math.round( total / timeseries.length );
}

export default function ChartSlot( { timeseries }: { timeseries: ApmTimePoint[] } ) {
	const data = toSeriesData( timeseries );
	const averageTotal = getAverageTotal( timeseries );

	return (
		<Card>
			<CardHeader>
				<HStack wrap spacing={ 4 } justify="space-between" alignment="flex-start">
					<VStack spacing={ 2 } alignment="flex-start">
						<Text size="title" weight={ 500 } as="h2">
							{ __( 'Response time breakdown' ) }
						</Text>
						<Text size={ 32 } weight={ 500 } lineHeight="40px">
							{ formatMs( averageTotal ) }
						</Text>
						<Text variant="muted">
							{ __(
								'Average time spent across the database, WordPress core, plugins, external requests, and cache.'
							) }
						</Text>
					</VStack>
				</HStack>
			</CardHeader>
			<CardBody>
				<GlobalChartsProvider>
					<AreaChart
						chartId={ CHART_ID }
						height={ 320 }
						data={ data }
						stacked
						curveType="monotone"
						showLegend
						legend={ { interactive: true } }
						withTooltips
					/>
				</GlobalChartsProvider>
			</CardBody>
		</Card>
	);
}
