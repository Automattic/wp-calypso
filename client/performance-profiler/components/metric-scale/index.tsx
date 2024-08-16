import './style.scss';
import clsx from 'clsx';
import { Valuation } from 'calypso/performance-profiler/types/performance-metrics';
import { metricsTresholds, max2Decimals } from 'calypso/performance-profiler/utils/metrics';

type Props = {
	metricName: string;
	value: number;
	valuation: Valuation;
};

export const MetricScale = ( { metricName, value, valuation }: Props ) => {
	const { good, needsImprovement, bad } =
		metricsTresholds[ metricName as keyof typeof metricsTresholds ];

	const formatValue = ( value: number ): string => {
		if ( value === null || value === undefined ) {
			return '';
		}

		if ( [ 'lcp', 'fcp', 'ttfb' ].includes( metricName ) ) {
			return `${ max2Decimals( value / 1000 ) }`;
		}
		return `${ max2Decimals( value ) }`;
	};

	return (
		<div className="metrics-scale">
			<div className="progress-bar">
				<div
					className={ clsx( 'bar-section good', { active: valuation === 'good' } ) }
					style={ { width: `${ ( good / bad ) * 100 }%` } }
				></div>
				<div
					className={ clsx( 'bar-section needs-improvement', {
						active: valuation === 'needsImprovement',
					} ) }
					style={ { width: `${ ( ( needsImprovement - good ) / bad ) * 100 }%` } }
				></div>
				<div
					className={ clsx( 'bar-section bad', { active: valuation === 'bad' } ) }
					style={ { width: `${ ( ( bad - needsImprovement ) / bad ) * 100 }%` } }
				></div>
				<div className="dot" style={ { left: `${ value > bad ? 100 : ( value / bad ) * 100 }%` } }>
					<div className="label">{ formatValue( value ) }</div>
				</div>
			</div>
			<div className="progress-bar-legend">
				<div>0</div>
				<div className="good" style={ { left: `${ ( good / bad ) * 100 }%` } }>
					{ formatValue( good ) }
				</div>
				<div
					className="needs-improvement"
					style={ { left: `${ ( needsImprovement / bad ) * 100 }%` } }
				>
					{ formatValue( needsImprovement ) }
				</div>
				<div className="bad" style={ { left: `${ ( bad / bad ) * 100 }%` } }>
					{ formatValue( bad ) }+
				</div>
			</div>
		</div>
	);
};
