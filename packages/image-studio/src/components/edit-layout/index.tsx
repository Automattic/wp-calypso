import { cn } from '@automattic/agenttic-ui';
import {
	__unstableAnimatePresence as AnimatePresence,
	__unstableMotion as motion,
} from '@wordpress/components';
import { useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Canvas } from '../canvas';
import type { ReactNode } from 'react';
import './style.scss';

interface EditLayoutProps {
	image: ReactNode;
	overlay?: ReactNode;
	isAiProcessing: boolean;
	isAiProcessed: boolean;
	isAnnotationSaving?: boolean;
	showProcessingOverlay?: boolean;
	canvasControls?: ReactNode;
	imageUrl?: string | null;
	isRenderedImageLoaded?: boolean;
	attachmentId?: number | null;
	isCurrentAttachmentAnnotated?: boolean;
	originalAttachmentId?: number | null;
}

export const EditLayout = ( {
	image,
	overlay,
	isAiProcessing,
	isAiProcessed,
	isAnnotationSaving = false,
	showProcessingOverlay = false,
	canvasControls,
	isRenderedImageLoaded = false,
	attachmentId,
	isCurrentAttachmentAnnotated,
	originalAttachmentId,
	imageUrl,
}: EditLayoutProps ) => {
	const [ imageKey, setImageKey ] = useState< number | null >( originalAttachmentId ?? null );

	// Track the last loaded image URL for the placeholder
	const [ placeholderUrl, setPlaceholderUrl ] = useState< string | null >( null );

	const prevAttachmentId = useRef< typeof attachmentId >( null );

	useEffect( () => {
		// Only update the image key when the attachmentId changes, skipping annotated images
		const hasAttachmentChanged = !! attachmentId && prevAttachmentId.current !== attachmentId;
		const isAnnotatedImage = isCurrentAttachmentAnnotated || isAnnotationSaving;

		if ( hasAttachmentChanged && ! isAnnotatedImage ) {
			setImageKey( attachmentId );
		}

		// Track the previous attachmentId
		prevAttachmentId.current = attachmentId;
	}, [ attachmentId, isCurrentAttachmentAnnotated, isAnnotationSaving ] );

	// Set placeholder on initial load
	useEffect( () => {
		if ( isRenderedImageLoaded && imageUrl && ! placeholderUrl ) {
			setPlaceholderUrl( imageUrl );
		}
	}, [ isRenderedImageLoaded, imageUrl, placeholderUrl ] );

	const isAnnotatedImage = isCurrentAttachmentAnnotated || isAnnotationSaving;

	// Use attachmentId as key for non-annotated images to trigger cross fade between images
	// Use stable imageKey for annotated images to prevent fade during annotation flow
	const effectiveImageKey = isAnnotatedImage ? imageKey : attachmentId;

	// For annotated images, never show loading so that the transition from blob -> uploaded annotation is seamless
	const shouldShowLoading = ! isAnnotatedImage && ! isRenderedImageLoaded;

	return (
		<div className="image-studio-edit-layout">
			<div role="status" aria-live="polite" aria-atomic="true" className="image-studio-sr-only">
				{ isAnnotationSaving && __( 'Saving your annotation…', 'big-sky' ) }
				{ ! isAnnotationSaving &&
					isAiProcessing &&
					__( 'AI is currently editing your image. Please wait.', 'big-sky' ) }
				{ ! isAnnotationSaving &&
					! isAiProcessing &&
					isAiProcessed &&
					__( 'AI has finished editing your image.', 'big-sky' ) }
			</div>

			<Canvas fit="contain" overlay={ overlay } loading={ shouldShowLoading }>
				{ /* Hidden placeholder image to maintain layout dimensions during transitions */ }
				{ placeholderUrl && (
					<img
						src={ placeholderUrl }
						alt=""
						aria-hidden="true"
						className="image-studio-placeholder-image"
					/>
				) }
				<AnimatePresence mode="wait" onExitComplete={ () => setPlaceholderUrl( imageUrl ?? null ) }>
					<motion.div
						key={ effectiveImageKey }
						className={ cn( 'image-studio-image-container', {
							'image-studio-image-processing': showProcessingOverlay,
						} ) }
						initial={ { opacity: 0 } }
						animate={ {
							opacity: shouldShowLoading ? 0 : 1,
						} }
						exit={ { opacity: 0 } }
						transition={ { duration: 0.3 } }
					>
						{ image }
					</motion.div>
				</AnimatePresence>
				{ canvasControls }
			</Canvas>
		</div>
	);
};
