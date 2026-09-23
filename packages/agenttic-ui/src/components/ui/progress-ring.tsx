import * as React from 'react';
import { cn } from '../../utils/classNames';
import styles from './progress-ring.module.css';

export type ProgressRingTone = 'primary' | 'error' | 'muted';

export interface ProgressRingProps {
	/** Filled portion of the ring, 0–100. */
	percent: number;
	tone?: ProgressRingTone;
	size?: number;
	strokeWidth?: number;
	className?: string;
}

// Geometry keeps the fraction: a sub-1% remainder still draws (as the round
// cap's dot), and only an actual zero hides the arc. Rounding is for labels.
export function clampPercent( percent: number ): number {
	if ( ! Number.isFinite( percent ) ) {
		return 0;
	}
	return Math.min( 100, Math.max( 0, percent ) );
}

/**
 * Presentational donut. The arc tweens between values via CSS, and is hidden
 * (rather than drawn at zero length) at 0% so the round cap leaves no dot.
 * Decorative only: the host labels whatever wraps it.
 */
export function ProgressRing( {
	percent,
	tone = 'primary',
	size = 16,
	strokeWidth = 2,
	className,
}: ProgressRingProps ) {
	const value = clampPercent( percent );
	const radius = ( size - strokeWidth ) / 2;
	const circumference = 2 * Math.PI * radius;
	const offset = circumference * ( 1 - value / 100 );

	return (
		<svg
			data-slot="progress-ring"
			className={ cn( styles.ring, styles[ tone ], { [ styles.empty ]: value === 0 }, className ) }
			width={ size }
			height={ size }
			viewBox={ `0 0 ${ size } ${ size }` }
			aria-hidden="true"
			focusable="false"
		>
			<circle
				className={ styles.track }
				cx={ size / 2 }
				cy={ size / 2 }
				r={ radius }
				strokeWidth={ strokeWidth }
			/>
			<circle
				className={ styles.fill }
				cx={ size / 2 }
				cy={ size / 2 }
				r={ radius }
				strokeWidth={ strokeWidth }
				strokeDasharray={ circumference }
				strokeDashoffset={ offset }
			/>
		</svg>
	);
}
