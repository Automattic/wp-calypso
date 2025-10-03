import clsx from 'clsx';
import type { ReactNode } from 'react';

import './style.scss';

const CircularProgressBar = ( {
	currentStep,
	numberOfSteps,
	size,
	enableDesktopScaling = false,
	strokeColor,
	strokeWidth = 4,
	showProgressText = true,
	customText,
	variant,
}: {
	currentStep: number | null;
	numberOfSteps: number | null;
	size: number;
	enableDesktopScaling?: boolean;
	strokeColor?: string;
	strokeWidth?: number;
	showProgressText?: boolean;
	customText?: ReactNode;
	variant?: 'success';
} ) => {
	const SIZE = size;
	const RADIUS = SIZE / 2 - strokeWidth / 2;
	const FULL_ARC = 2 * Math.PI * RADIUS;

	if ( currentStep === null || ! numberOfSteps ) {
		return null;
	}

	return (
		<div
			role="progressbar"
			className={ clsx( 'circular__progress-bar', {
				'desktop-scaling': enableDesktopScaling,
				'is-success': variant === 'success',
			} ) }
			style={ { width: SIZE, height: SIZE } }
		>
			<svg
				viewBox={ `0 0 ${ SIZE } ${ SIZE }` }
				style={ { width: SIZE, height: SIZE } }
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<circle
					className="circular__progress-bar-empty-circle"
					fill="none"
					cx={ SIZE / 2 }
					cy={ SIZE / 2 }
					r={ RADIUS }
					strokeWidth={ strokeWidth }
				/>
				<circle
					style={ {
						display: currentStep === 0 ? 'none' : 'block',
						stroke: strokeColor,
						strokeDasharray: `${ FULL_ARC * ( currentStep / numberOfSteps ) }, ${ FULL_ARC }`,
					} }
					className="circular__progress-bar-fill-circle"
					fill="none"
					cx={ SIZE / 2 }
					cy={ SIZE / 2 }
					r={ RADIUS }
					strokeWidth={ strokeWidth }
				/>
			</svg>
			{ ( customText || showProgressText ) && (
				<div className="circular__progress-bar-text">
					{ customText || `${ currentStep }/${ numberOfSteps }` }
				</div>
			) }
		</div>
	);
};

export default CircularProgressBar;
