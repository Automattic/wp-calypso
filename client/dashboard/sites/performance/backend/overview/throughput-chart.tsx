import { AreaChart, type SeriesData } from '@automattic/charts';
import '@automattic/charts/style.css';
import { __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Card, CardBody, CardHeader } from '../../../../components/card';
import type { ApmTimePoint } from '@automattic/api-core';

export default function ThroughputChart( { timeseries }: { timeseries: ApmTimePoint[] } ) {
	const data: SeriesData[] = [
		{
			label: __( 'Requests per minute' ),
			data: timeseries.map( ( point ) => ( {
				date: new Date( point.timestamp ),
				value: point.throughput,
			} ) ),
		},
	];

	return (
		<Card>
			<CardHeader>
				<Text weight={ 600 }>{ __( 'Throughput' ) }</Text>
			</CardHeader>
			<CardBody>
				<AreaChart
					height={ 240 }
					data={ data }
					stacked={ false }
					curveType="monotone"
					withTooltips
				/>
			</CardBody>
		</Card>
	);
}
