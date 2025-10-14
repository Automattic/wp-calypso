import * as React from 'react';
import { cn } from '../../utils/classNames';
import styles from './canvas.module.css';

export interface CanvasProps {
	/** Content to display in the canvas */
	children: React.ReactNode;
	/** Additional CSS class */
	className?: string;
	/** Inline styles */
	style?: React.CSSProperties;
	/** How content should fit within the canvas */
	fit?: 'contain' | 'cover' | 'fill' | 'none';
	/** Background color or pattern */
	background?: string;
	/** Whether to show a loading state */
	isLoading?: boolean;
	/** Loading message to display */
	loadingMessage?: string;
}

/**
 * Canvas - A generic content workspace area
 *
 * This component provides a centered, flexible container for displaying
 * and editing content (images. etc.). It handles sizing,
 * centering, and basic interaction patterns.
 *
 * @example
 * ```tsx
 * <Canvas fit="contain">
 *   <img src="..." alt="..." />
 * </Canvas>
 * ```
 */
export const Canvas = React.forwardRef< HTMLDivElement, CanvasProps >(
	function Canvas(
		{
			children,
			className,
			style,
			fit = 'contain',
			background,
			isLoading = false,
			loadingMessage = 'Loading...',
		},
		ref
	) {
		return (
			<div
				ref={ ref }
				className={ cn( styles.canvas, styles[ fit ], className ) }
				style={ {
					...style,
					...( background ? { background } : {} ),
				} }
				data-slot="canvas"
			>
				{ isLoading ? (
					<div className={ styles.loading }>
						<div className={ styles.loadingSpinner } />
						<span className={ styles.loadingText }>
							{ loadingMessage }
						</span>
					</div>
				) : (
					children
				) }
			</div>
		);
	}
);

Canvas.displayName = 'Canvas';
