/**
 * Image Feedback Buttons Component
 *
 * Displays thumbs up/down feedback buttons overlaid on the bottom-left of the generated image.
 * Uses the Agenttic UI MessageActions component for consistent styling and behavior.
 */
import { cn, MessageActions, ThumbsDownIcon, ThumbsUpIcon } from '@automattic/agenttic-ui';
import { useCallback, useEffect, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { trackImageStudioImageFeedback } from '../../utils/tracking';
import type { ImageStudioMode } from '../../types';
import './style.scss';

interface ImageFeedbackButtonsProps {
	imageUrl: string;
	attachmentId: number | null;
	sessionId: string;
	mode: ImageStudioMode;
	isVisible: boolean;
}

/**
 * Submit feedback for an image to the API and track the event
 * @param {string}          imageUrl     - URL of the image being rated
 * @param {'up' | 'down'}   feedback     - User's feedback rating
 * @param {string}          sessionId    - Current session ID
 * @param {ImageStudioMode} mode         - Image Studio mode (edit or generate)
 * @param {number | null}   attachmentId - WordPress attachment ID if available
 */
function submitImageFeedback(
	imageUrl: string,
	feedback: 'up' | 'down',
	sessionId: string,
	mode: ImageStudioMode,
	attachmentId: number | null
): void {
	// Track the feedback event
	trackImageStudioImageFeedback( {
		feedback,
		attachmentId,
		mode,
	} );

	// TODO: Send feedback to the API for which we will need imageUrl and sessionId.
}

export const ImageFeedbackButtons = ( {
	imageUrl,
	attachmentId,
	sessionId,
	mode,
	isVisible,
}: ImageFeedbackButtonsProps ) => {
	const [ selectedFeedback, setSelectedFeedback ] = useState< 'up' | 'down' | null >( null );

	// Reset feedback when image changes
	useEffect( () => {
		setSelectedFeedback( null );
	}, [ imageUrl ] );

	const handleFeedback = useCallback(
		( feedback: 'up' | 'down' ) => {
			// Don't allow changing feedback once selected
			if ( selectedFeedback !== null ) {
				return;
			}

			setSelectedFeedback( feedback );
			submitImageFeedback( imageUrl, feedback, sessionId, mode, attachmentId );
		},
		[ imageUrl, sessionId, mode, attachmentId, selectedFeedback ]
	);

	// Create a synthetic message object to use with MessageActions component
	const actionMessage = useMemo(
		() => ( {
			id: `image_${ attachmentId || 'generated' }`,
			role: 'agent' as const,
			content: [],
			timestamp: Date.now(),
			archived: false,
			showIcon: false,
			actions: [
				{
					id: 'feedback-up',
					label: __( 'Good response', 'default' ),
					icon: <ThumbsUpIcon />,
					onClick: () => handleFeedback( 'up' ),
					tooltip: __( 'Good response', 'default' ),
					disabled: selectedFeedback === 'down',
					pressed: selectedFeedback === 'up',
				},
				{
					id: 'feedback-down',
					label: __( 'Bad response', 'default' ),
					icon: <ThumbsDownIcon />,
					onClick: () => handleFeedback( 'down' ),
					tooltip: __( 'Bad response', 'default' ),
					disabled: selectedFeedback === 'up',
					pressed: selectedFeedback === 'down',
				},
			],
		} ),
		[ attachmentId, handleFeedback, selectedFeedback ]
	);

	return (
		<div
			className={ cn( 'image-feedback-buttons', {
				'image-feedback-buttons--visible': isVisible,
			} ) }
		>
			<MessageActions message={ actionMessage } />
		</div>
	);
};
