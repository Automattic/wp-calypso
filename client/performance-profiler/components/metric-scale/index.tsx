import React from 'react';
import './style.scss';
import { metricsTresholds } from 'calypso/performance-profiler/utils/metrics';

type Props = {
	metricName: string;
	value: number;
};

export const MetricScale = ( { metricName, value }: Props ) => {
	const { good, needsImprovement, bad } =
		metricsTresholds[ metricName as keyof typeof metricsTresholds ];

	return (
		<div className="metrics-scale">
			<div className="progress-bar">
				<div className="bar-section fast" style={ { width: `${ ( good / bad ) * 100 }%` } }></div>
				<div
					className="bar-section moderate"
					style={ { width: `${ ( ( needsImprovement - good ) / bad ) * 100 }%` } }
				></div>
				<div
					className="bar-section slow"
					style={ { width: `${ ( ( bad - needsImprovement ) / bad ) * 100 }%` } }
				></div>
				<div className="dot" style={ { left: `${ ( value / bad ) * 100 }%` } }>
					<div className="label">{ value.toFixed( 1 ) }</div>
				</div>
			</div>
			<div className="progress-bar-legend">
				<div>0</div>
				<div className="good" style={ { left: `${ ( good / bad ) * 100 }%` } }>
					{ good }
				</div>
				<div
					className="needs-improvement"
					style={ { left: `${ ( needsImprovement / bad ) * 100 }%` } }
				>
					{ needsImprovement }
				</div>
				<div className="bad" style={ { left: `${ ( bad / bad ) * 100 }%` } }>
					{ bad }+
				</div>
			</div>
		</div>
	);
};
