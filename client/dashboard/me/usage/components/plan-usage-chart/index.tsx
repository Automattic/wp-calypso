import { DataPointPercentage, Legend, PieChart } from '@automattic/charts';
import { __experimentalHStack as HStack } from '@wordpress/components';
import { useMemo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { chartColors } from '../../constants';
import FlexUsageCard from '../flex-usage-card';
import { usePlanUsage } from './use-plan-usage';

export function PlanUsageChart( { start, end }: { start: number; end: number } ) {
	const { fractions, isLoading } = usePlanUsage( start, end, 'day' );

	const data: DataPointPercentage[] = useMemo( () => {
		const totalFrac = fractions.storage + fractions.bandwidth + fractions.compute;
		if ( totalFrac <= 0 ) {
			return [];
		}
		const items = [
			{ label: __( 'Bandwidth' ), value: fractions.bandwidth },
			{ label: __( 'Storage' ), value: fractions.storage },
			{ label: __( 'Compute' ), value: fractions.compute },
		];
		return items.map( ( item, i ) => {
			const percentage = ( item.value * 100 ) / totalFrac;
			return {
				label: item.label,
				value: item.value,
				percentage,
				valueDisplay: `${ Math.round( percentage ) }%`,
				color: chartColors[ i % chartColors.length ],
			} as DataPointPercentage;
		} );
	}, [ fractions.bandwidth, fractions.storage, fractions.compute ] );

	return (
		<FlexUsageCard
			title={ __( 'Plan usage' ) }
			description={ __( 'This section provides an overview of your plan usage.' ) }
			isLoading={ isLoading }
		>
			<Legend
				chartId="plan-usage-chart"
				items={ data.map( ( d ) => ( {
					label: d.label,
					value: '',
					color: d.color || '',
				} ) ) }
			/>
			<HStack alignment="center">
				<PieChart
					chartId="plan-usage-chart"
					size={ 260 }
					thickness={ 0.3 }
					gapScale={ 0.02 }
					data={ data }
					showLabels={ false }
					withTooltips
				/>
			</HStack>
		</FlexUsageCard>
	);
}

export default PlanUsageChart;
