import { __experimentalHStack as HStack } from '@wordpress/components';
import { Progress } from '@wordpress/ui';
import clsx from 'clsx';
import { useId } from 'react';
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
	metric?: string;

	/**
	 * The color of the progress bar. If none is provided the admin theme colour
	 * will be used.
	 */
	progressColor?: 'alert-yellow' | 'alert-red' | 'alert-green';

	/**
	 * The value screen readers announce for the progress bar, after the
	 * strapline that names it. Also its name when there is no strapline.
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
	const straplineId = useId();
	return (
		<div
			className={ clsx( `dashboard-stat--density-${ density }`, {
				'dashboard-stat--is-loading': isLoading,
			} ) }
		>
			{ strapline && (
				<div id={ straplineId } className="dashboard-stat__strapline">
					{ strapline }
				</div>
			) }
			<HStack
				alignment="baseline"
				spacing={ 2 }
				justify={ progressValue === undefined ? 'start' : 'space-between' }
			>
				<div className="dashboard-stat__metric">
					<TextBlur isBlurred={ isLoading } length={ 5 }>
						{ metric }
					</TextBlur>
				</div>
				{ description && ! isLoading && (
					<div className="dashboard-stat__description">{ description }</div>
				) }
			</HStack>
			{ progressValue !== undefined && (
				<Progress.Root
					className={ `dashboard-stat__progress-bar dashboard-stat__progress-bar--${ progressColor }` }
					value={ progressValue }
					aria-labelledby={ strapline ? straplineId : undefined }
					aria-label={ strapline ? undefined : progressLabel }
					aria-valuetext={ progressLabel }
					aria-hidden={ isLoading }
				>
					<Progress.Track>
						<Progress.Indicator />
					</Progress.Track>
				</Progress.Root>
			) }
		</div>
	);
}
