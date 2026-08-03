import { AreaChart, GlobalChartsProvider, type SeriesData } from '@automattic/charts';
import {
	__experimentalHStack as HStack,
	__experimentalVStack as VStack,
} from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { dashboardChartTheme } from '../../../../app/chart-theme';
import { useLocale } from '../../../../app/locale';
import { Card, CardBody, CardHeader } from '../../../../components/card';
import { Text } from '../../../../components/text';
import { formatMs } from '../utils';
import type { ApmSummary, ApmTimePoint } from '@automattic/api-core';

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

function formatMsValue( value: number, locale: string ): string {
	return sprintf(
		/* translators: %s is a formatted number of milliseconds, e.g. 2,500 */
		__( '%s ms' ),
		Math.round( value ).toLocaleString( locale )
	);
}

function formatTooltipDate( date: Date, locale: string ): string {
	return date.toLocaleDateString( locale, {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
	} );
}

function formatTooltipTime( date: Date, locale: string ): string {
	return date.toLocaleTimeString( locale, {
		hour: '2-digit',
		minute: '2-digit',
	} );
}

export default function ChartSlot( {
	timeseries,
	summary,
}: {
	timeseries: ApmTimePoint[];
	summary: ApmSummary;
} ) {
	const locale = useLocale();
	const data = toSeriesData( timeseries );

	return (
		<Card>
			<CardHeader>
				<HStack wrap spacing={ 4 } justify="space-between" alignment="flex-start">
					<VStack spacing={ 2 } alignment="flex-start">
						<Text size="title" weight={ 500 } as="h2">
							{ __( 'Response time breakdown' ) }
						</Text>
						<Text size={ 32 } weight={ 500 } lineHeight="40px">
							{ formatMs( summary.avg_response_ms ) }
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
				<GlobalChartsProvider theme={ dashboardChartTheme }>
					<AreaChart
						chartId={ CHART_ID }
						height={ 320 }
						data={ data }
						stacked
						curveType="monotone"
						zoomable
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
									<HStack spacing={ 2 } expanded={ false } justify="flex-start">
										<Text weight={ 600 }>{ formatTooltipDate( date, locale ) }</Text>
										<span
											aria-hidden
											style={ {
												flex: '0 0 auto',
												width: 3,
												height: 3,
												borderRadius: '50%',
												background: 'currentColor',
												opacity: 0.4,
											} }
										/>
										<Text variant="muted">{ formatTooltipTime( date, locale ) }</Text>
									</HStack>
									<VStack spacing={ 1 }>
										{ series.map( ( entry ) => {
											const value = ( entry.datum as { value?: number } ).value ?? 0;
											return (
												<HStack key={ entry.key } justify="space-between" spacing={ 3 }>
													<HStack spacing={ 2 } justify="flex-start" expanded={ false }>
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
														{ formatMsValue( value, locale ) }
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
								y: { tickFormat: ( value ) => formatMsValue( value as number, locale ) },
							},
						} }
					/>
				</GlobalChartsProvider>
			</CardBody>
		</Card>
	);
}
