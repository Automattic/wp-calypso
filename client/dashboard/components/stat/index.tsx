import { __experimentalHStack as HStack, ProgressBar } from '@wordpress/components';
import clsx from 'clsx';
import { TextSkeleton } from '../text-skeleton';
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
	metric?: string;

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
	return (
		<div
			className={ clsx( `dashboard-stat--density-${ density }`, {
				'dashboard-stat--is-loading': isLoading,
			} ) }
		>
			{ strapline && <div className="dashboard-stat__strapline">{ strapline }</div> }
			<HStack
				alignment="baseline"
				spacing={ 2 }
				justify={ progressValue === undefined ? 'start' : 'space-between' }
			>
				<div className="dashboard-stat__metric">
					{ isLoading ? <TextSkeleton length={ 5 } /> : metric }
				</div>
				{ description && ! isLoading && (
					<div className="dashboard-stat__description">
						{ isLoading ? <TextSkeleton length={ 8 } /> : description }
					</div>
				) }
			</HStack>
			{ progressValue !== undefined && (
				<ProgressBar
					className={ `dashboard-stat__progress-bar dashboard-stat__progress-bar--${ progressColor }` }
					value={ progressValue }
					aria-label={ progressLabel }
					aria-hidden={ isLoading }
				/>
			) }
		</div>
	);
}
