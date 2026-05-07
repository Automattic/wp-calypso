import { AreaChart, type SeriesData } from '@automattic/charts';
import '@automattic/charts/style.css';
import { __experimentalText as Text } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Card, CardBody, CardHeader } from '../../../../components/card';
import type { ApmTimePoint } from '@automattic/api-core';

type BreakdownKey = 'db' | 'wp_core' | 'plugins' | 'external';

export default function ResponseTimeChart( { timeseries }: { timeseries: ApmTimePoint[] } ) {
	const series: Array< { key: BreakdownKey; label: string } > = [
		{ key: 'db', label: __( 'Database' ) },
		{ key: 'wp_core', label: __( 'WordPress core' ) },
		{ key: 'plugins', label: __( 'Plugins' ) },
		{ key: 'external', label: __( 'External' ) },
	];

	const data: SeriesData[] = series.map( ( { key, label } ) => ( {
		label,
		data: timeseries.map( ( point ) => ( {
			date: new Date( point.timestamp ),
			value: point[ key ],
		} ) ),
	} ) );

	return (
		<Card>
			<CardHeader>
				<Text weight={ 600 }>{ __( 'Web transactions response time' ) }</Text>
			</CardHeader>
			<CardBody>
				<AreaChart
					height={ 320 }
					data={ data }
					stacked
					curveType="monotone"
					showLegend
					legend={ { position: 'top' } }
					withTooltips
				/>
			</CardBody>
		</Card>
	);
}
