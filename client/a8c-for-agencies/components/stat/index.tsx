import { ProgressBar } from '@automattic/components';
import clsx from 'clsx';
import TextPlaceholder from 'calypso/a8c-for-agencies/components/text-placeholder';

import './style.scss';

const progressColorMap = {
	'alert-green': 'var(--color-success-50)',
	'alert-red': 'var(--color-error-50)',
	'alert-yellow': 'var(--color-warning-50)',
} as const;

interface StatProps {
	density?: 'low' | 'high';
	description?: string;
	isLoading?: boolean;
	metric?: string;
	progressColor?: keyof typeof progressColorMap;
	progressLabel?: string;
	progressValue?: number;
	strapline?: string;
}

export function Stat( {
	density = 'low',
	description,
	isLoading = false,
	metric,
	progressColor,
	progressValue,
	progressLabel = progressValue !== undefined ? `${ progressValue }%` : undefined,
	strapline,
}: StatProps ) {
	return (
		<div
			className={ clsx( 'a4a-stat', `a4a-stat--density-${ density }`, {
				'a4a-stat--is-loading': isLoading,
			} ) }
		>
			{ strapline && <div className="a4a-stat__strapline">{ strapline }</div> }
			<div
				className={ clsx( 'a4a-stat__header', {
					'a4a-stat__header--with-progress': progressValue !== undefined,
				} ) }
			>
				<div className="a4a-stat__metric">
					{ isLoading ? (
						<div className="a4a-stat__metric-placeholder">
							<TextPlaceholder />
						</div>
					) : (
						metric
					) }
				</div>
				{ description && ! isLoading && (
					<div className="a4a-stat__description">{ description }</div>
				) }
			</div>
			{ progressValue !== undefined && (
				<ProgressBar
					className="a4a-stat__progress-bar"
					compact
					value={ isLoading ? 0 : progressValue }
					total={ 100 }
					title={ progressLabel }
					color={ progressColor ? progressColorMap[ progressColor ] : undefined }
				/>
			) }
		</div>
	);
}
