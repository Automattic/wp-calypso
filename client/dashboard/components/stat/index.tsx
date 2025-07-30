import { __experimentalHStack as HStack, ProgressBar } from '@wordpress/components';
import { TextBlur } from '../text-blur';
import './style.scss';

interface StatProps {
	/**
	 * Determines how much vertical space the stat should take up.
	 */
	density?: 'low' | 'high';

	/**
	 * When progressValue is undefined, this is a short description presented
	 * beside the metric. Otherwise, it describes the maximum value of the metric.
	 */
	description?: string;

	/**
	 * Obscure text while loading.
	 */
	isLoading?: boolean;

	/**
	 * The main value to display. Remember to include units.
	 */
	metric: string;

	/**
	 * The color of the progress bar. If none is provided the admin theme colour
	 * will be used.
	 */
	progressColor?: 'alert-yellow' | 'alert-red' | 'alert-green';

	/**
	 * Accessible label for the progress bar.
	 */
	progressLabel?: string;

	/**
	 * The value of the progress bar as a percentage. If this is undefined, no
	 * progress bar will be displayed.
	 */
	progressValue?: number;

	/**
	 * A short heading for the metric.
	 */
	strapline?: string;
}

export function Stat( {
	density = 'low',
	description,
	isLoading = false,
	metric,
	progressColor,
	progressValue,
	progressLabel = `${ progressValue }%`,
	strapline,
}: StatProps ) {
	const metricElement = isLoading ? <TextBlur>{ metric }</TextBlur> : metric;
	const descriptionElement = isLoading ? <TextBlur>{ description }</TextBlur> : description;

	return (
		<div className={ `dashboard-stat--density-${ density }` }>
			{ strapline && <div className="dashboard-stat__strapline">{ strapline }</div> }
			<HStack
				alignment="baseline"
				spacing={ 2 }
				justify={ progressValue === undefined ? 'start' : 'space-between' }
			>
				<div className="dashboard-stat__metric">{ metricElement }</div>
				{ description && <div className="dashboard-stat__description">{ descriptionElement }</div> }
			</HStack>
			{ progressValue !== undefined && (
				<ProgressBar
					className={ `dashboard-stat__progress-bar dashboard-stat__progress-bar--${ progressColor }` }
					value={ isLoading ? 0 : progressValue }
					aria-label={ progressLabel }
					aria-hidden={ isLoading }
				/>
			) }
		</div>
	);
}
