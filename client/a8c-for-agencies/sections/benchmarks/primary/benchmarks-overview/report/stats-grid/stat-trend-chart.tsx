import { LineChart } from '@automattic/charts';
import { formatQuarterShort } from '../../../../lib/format-quarter';
import type { Quarter } from '../../../../constants';

import '@automattic/charts/style.css';

const STROKE = 'var(--color-primary)';
const POINT_FILL = 'var(--color-surface)';

export type TrendPoint = { quarter: Quarter; value: number };

type Props = {
	points: TrendPoint[];
	formatter: ( value: number ) => string;
};

function quarterToDate( { quarter, year }: Quarter ): Date {
	return new Date( Date.UTC( year, ( quarter - 1 ) * 3, 1 ) );
}

function dateToQuarter( date: Date ): Quarter {
	const month = date.getUTCMonth();
	return {
		quarter: ( Math.floor( month / 3 ) + 1 ) as 1 | 2 | 3 | 4,
		year: date.getUTCFullYear(),
	};
}

export default function StatTrendChart( { points, formatter }: Props ) {
	const series = [
		{
			label: 'trend',
			data: points.map( ( p ) => ( {
				date: quarterToDate( p.quarter ),
				value: p.value,
			} ) ),
			options: { stroke: STROKE },
		},
	];

	return (
		<div className="benchmarks-stat-trend">
			<LineChart
				height={ 120 }
				data={ series }
				withGradientFill={ false }
				curveType="linear"
				options={ {
					axis: {
						x: {
							tickFormat: ( value: unknown ) => {
								const date = value instanceof Date ? value : new Date( value as number | string );
								return formatQuarterShort( dateToQuarter( date ) );
							},
						},
						y: { tickFormat: () => '', numTicks: 0 },
					},
				} }
				renderGlyph={ ( { x, y } ) => (
					<circle
						cx={ x }
						cy={ y }
						r={ 4 }
						fill={ POINT_FILL }
						stroke={ STROKE }
						strokeWidth={ 2 }
					/>
				) }
				renderTooltip={ ( { tooltipData } ) => {
					const datum = tooltipData?.nearestDatum?.datum as
						| { date: Date; value: number }
						| undefined;
					if ( ! datum ) {
						return null;
					}
					return `${ formatQuarterShort( dateToQuarter( datum.date ) ) }: ${ formatter(
						datum.value
					) }`;
				} }
			/>
		</div>
	);
}
