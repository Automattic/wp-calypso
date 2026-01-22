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
	feedbackButtons?: ReactNode;
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
	feedbackButtons,
	isRenderedImageLoaded = false,
	attachmentId,
	isCurrentAttachmentAnnotated,
	originalAttachmentId,
}: EditLayoutProps ) => {
	// Only show loading animation when the image key changes and the image is not loaded
	const [ shouldShowLoading, setShouldShowLoading ] = useState< boolean >( true );
	const [ imageKey, setImageKey ] = useState< number | null >( originalAttachmentId ?? null );

	const prevImageKey = useRef< typeof imageKey >( null );
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

		// Show loading spinner when we switch to a new image but the image is not loaded yet
		if ( prevImageKey.current !== imageKey && ! isRenderedImageLoaded ) {
			setShouldShowLoading( true );
			prevImageKey.current = imageKey;
		} else {
			setShouldShowLoading( false );
		}
	}, [
		imageKey,
		attachmentId,
		isCurrentAttachmentAnnotated,
		isAnnotationSaving,
		isRenderedImageLoaded,
	] );

	return (
		<div className="image-studio-edit-layout">
			<div role="status" aria-live="polite" aria-atomic="true" className="image-studio-sr-only">
				{ isAnnotationSaving && __( 'Saving your annotation…', 'default' ) }
				{ ! isAnnotationSaving &&
					isAiProcessing &&
					__( 'AI is currently editing your image. Please wait.', 'default' ) }
				{ ! isAnnotationSaving &&
					! isAiProcessing &&
					isAiProcessed &&
					__( 'AI has finished editing your image.', 'default' ) }
			</div>

			<Canvas fit="contain" overlay={ overlay } loading={ shouldShowLoading }>
				<AnimatePresence mode="wait">
					{ image && (
						<motion.div
							key={ imageKey }
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
					) }
				</AnimatePresence>
			</Canvas>
			{ feedbackButtons }
		</div>
	);
};
