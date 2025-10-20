import * as React from 'react';
import { cn } from '../../utils/classNames';
import styles from './canvas.module.css';
import { ThinkingMessage } from '../chat/ThinkingMessage';

export interface CanvasProps {
	/** Additional CSS class */
	className?: string;
	/** Inline styles */
	style?: React.CSSProperties;
	/** Whether to show a loading state */
	isProcessing?: boolean;
	/** Loader to display */
	loader?: React.ReactNode;
	/** Message to display */
	message?: string;
	/** Children to display */
	children?: React.ReactNode;
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
const Canvas = React.forwardRef< HTMLDivElement, CanvasProps >( function Canvas(
	{ className, style, isProcessing = false, loader, message = '', children },
	ref
) {
	return (
		<div
			ref={ ref }
			className={ cn( styles.canvas, className ) }
			data-slot="canvas"
			style={ {
				...style,
			} }
		>
			<div
				className={ cn(
					styles.canvas,
					isProcessing ? styles.processing : ''
				) }
			>
				{ message && (
					<div className={ styles.message }>
						<span className={ styles.messageText }>
							{ message }
						</span>
					</div>
				) }

				{ isProcessing && (
					<div className={ styles.loader }>
						{ loader ?? <ThinkingMessage /> }
					</div>
				) }
				<div className={ styles.content }>{ children }</div>
			</div>
		</div>
	);
} );

Canvas.displayName = 'Canvas';

export { Canvas };
