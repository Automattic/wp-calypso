import { AreaChart, GlobalChartsProvider, type SeriesData } from '@automattic/charts';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { Card, CardBody, CardHeader } from '../../../../components/card';
import { Text } from '../../../../components/text';
import { formatMs } from '../utils';
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

function formatMsValue( value: number ): string {
	return sprintf(
		/* translators: %s is a formatted number of milliseconds, e.g. 2,500 */
		__( '%s ms' ),
		Math.round( value ).toLocaleString()
	);
}

function formatTooltipDate( date: Date ): string {
	return date.toLocaleDateString( undefined, {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
	} );
}

function formatTooltipTime( date: Date ): string {
	return date.toLocaleTimeString( undefined, {
		hour: '2-digit',
		minute: '2-digit',
	} );
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
						renderTooltip={ ( { tooltipData, colorScale } ) => {
							const date = tooltipData?.nearestDatum?.datum?.date;
							if ( ! date ) {
								return null;
							}
							const series = Object.values( tooltipData?.datumByKey ?? {} );
							return (
								<VStack spacing={ 3 } style={ { padding: '4px 2px', minWidth: 240 } }>
									<VStack spacing={ 0 }>
										<Text weight={ 600 }>{ formatTooltipDate( date ) }</Text>
										<Text size={ 11 } variant="muted">
											{ formatTooltipTime( date ) }
										</Text>
									</VStack>
									<VStack spacing={ 1 }>
										{ series.map( ( entry ) => {
											const value = ( entry.datum as { value?: number } ).value ?? 0;
											return (
												<HStack key={ entry.key } justify="space-between" spacing={ 3 }>
													<HStack spacing={ 2 } justify="flex-start">
														<span
															aria-hidden
															style={ {
																display: 'inline-block',
																flex: '0 0 auto',
																width: 8,
																height: 8,
																borderRadius: 2,
																background: colorScale ? colorScale( entry.key ) : 'currentColor',
															} }
														/>
														<Text style={ { whiteSpace: 'nowrap' } }>{ entry.key }</Text>
													</HStack>
													<Text weight={ 500 } style={ { whiteSpace: 'nowrap' } }>
														{ formatMsValue( value ) }
													</Text>
												</HStack>
											);
										} ) }
									</VStack>
								</VStack>
							);
						} }
						options={ {
							axis: {
								y: { tickFormat: ( value ) => formatMsValue( value as number ) },
							},
						} }
					/>
				</GlobalChartsProvider>
			</CardBody>
		</Card>
	);
}
