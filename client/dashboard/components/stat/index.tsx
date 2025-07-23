import { __experimentalHStack as HStack, ProgressBar } from '@wordpress/components';
import './style.scss';

interface StatProps {
	density?: 'low' | 'high';
	description?: string;
	descriptionAlignment?: 'start' | 'end';
	metric: string;
	progressColor?: 'alert-yellow' | 'alert-red' | 'alert-green';
	progressValue?: number;
	strapline?: string;
}

export function Stat( {
	density = 'low',
	description,
	descriptionAlignment = 'start',
	metric,
	progressColor,
	progressValue,
	strapline,
}: StatProps ) {
	return (
		<div className={ `dashboard-stat--density-${ density }` }>
			{ strapline && <div className="dashboard-stat__strapline">{ strapline }</div> }
			<HStack
				alignment="baseline"
				spacing={ 2 }
				justify={ descriptionAlignment === 'start' ? 'start' : 'space-between' }
			>
				<div className="dashboard-stat__metric">{ metric }</div>
				{ description && <div className="dashboard-stat__description">{ description }</div> }
			</HStack>
			{ progressValue !== undefined && (
				<ProgressBar
					className={ `dashboard-stat__progress-bar dashboard-stat__progress-bar--${ progressColor }` }
					value={ progressValue }
					aria-label={ `${ progressValue }%` }
				/>
			) }
		</div>
	);
}
