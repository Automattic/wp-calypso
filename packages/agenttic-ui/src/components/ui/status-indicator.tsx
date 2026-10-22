import * as React from 'react';
import { cn } from '../../utils/classNames';
import styles from './status-indicator.module.css';

export type StatusIndicatorTone = 'primary' | 'error' | 'muted';

export interface StatusIndicatorProps {
	tone?: StatusIndicatorTone;
	size?: number;
	className?: string;
}

/**
 * Presentational status dot that signals a state by colour alone.
 * Decorative only: the host labels whatever wraps it.
 */
export function StatusIndicator( {
	tone = 'primary',
	size = 12,
	className,
}: StatusIndicatorProps ) {
	return (
		<svg
			data-slot="status-indicator"
			className={ cn( styles.dot, styles[ tone ], className ) }
			width={ size }
			height={ size }
			viewBox="0 0 12 12"
			aria-hidden="true"
			focusable="false"
		>
			<circle className={ styles.fill } cx="6" cy="6" r="6" />
		</svg>
	);
}
