import { AreaChart, type SeriesData } from '@automattic/charts';
import { __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Card, CardBody, CardHeader } from '../../../../components/card';
import type { ApmTimePoint } from '@automattic/api-core';

import '@automattic/charts/style.css';

const SERIES: Array< { key: keyof Omit< ApmTimePoint, 'timestamp' >; label: string } > = [
	{ key: 'db', label: __( 'Database' ) },
	{ key: 'wp_core', label: __( 'WordPress core' ) },
	{ key: 'plugins', label: __( 'Plugins' ) },
	{ key: 'external', label: __( 'External' ) },
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

export default function ChartSlot( { timeseries }: { timeseries: ApmTimePoint[] } ) {
	const data = toSeriesData( timeseries );

	return (
		<Card>
			<CardHeader>
				<Text weight={ 500 }>{ __( 'Response time breakdown' ) }</Text>
			</CardHeader>
			<CardBody>
				<AreaChart
					height={ 320 }
					data={ data }
					stacked
					curveType="monotone"
					showLegend
					withTooltips
				/>
			</CardBody>
		</Card>
	);
}
