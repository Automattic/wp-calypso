import { cn } from '@automattic/agenttic-ui';
import { forwardRef } from '@wordpress/element';
import LoadingSpinner from '../loading-spinner';
import './style.scss';

export interface CanvasProps {
	className?: string;
	children?: React.ReactNode;
	overlay?: React.ReactNode;
	fit?: 'contain' | 'cover' | 'fill';
	loading?: boolean;
}

/**
 * Canvas component for displaying images
 * to be moved to @automattic/agenttic-ui
 */
const Canvas = forwardRef< HTMLDivElement, CanvasProps >(
	( { className, children, overlay, fit = 'contain', loading = false }, ref ) => (
		<div ref={ ref } className={ cn( 'image-studio-canvas', className ) } data-fit={ fit }>
			<div className="image-studio-canvas__content">{ children }</div>
			{ overlay && <div className="image-studio-canvas__overlay">{ overlay }</div> }
			{ loading && (
				<div className="image-studio-canvas__loading">
					<LoadingSpinner />
				</div>
			) }
		</div>
	)
);

Canvas.displayName = 'Canvas';
export { Canvas };
