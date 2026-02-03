/**
 * Canvas Controls Component
 *
 * Displays thumbs up/down feedback buttons overlaid on the bottom-left of the generated image.
 * Uses the Agenttic UI MessageActions component for consistent styling and behavior.
 */
import { MessageActions, ThumbsDownIcon, ThumbsUpIcon } from '@automattic/agenttic-ui';
import apiFetch from '@wordpress/api-fetch';
import { __unstableMotion as motion } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useCallback, useEffect, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { store as imageStudioStore } from '../../store';
import { trackImageStudioImageFeedback } from '../../utils/tracking';
import { ImageActionsMenu } from '../image-actions-menu';
import { RevisionNavigator } from './revision-navigator';
import type { ImageStudioMode } from '../../types';
import './style.scss';

interface CanvasControlsProps {
	imageUrl: string;
	attachmentId: number | null;
	sessionId: string;
	mode: ImageStudioMode;
	showFeedbackButtons: boolean;
	showImageActionsMenu?: boolean;
	onSave?: () => void;
	onRevertToOriginal?: () => void;
}

/**
 * Submit feedback for an image to the API and track the event
 * @param {string}          imageUrl     - URL of the image being rated
 * @param {'up' | 'down'}   feedback     - User's feedback rating
 * @param {string}          sessionId    - Current session ID
 * @param {ImageStudioMode} mode         - Image Studio mode (edit or generate)
 * @param {number | null}   attachmentId - WordPress attachment ID if available
 * @param {string | null}   messageId    - Agent message ID for feedback tracking
 */
function submitImageFeedback(
	imageUrl: string,
	feedback: 'up' | 'down',
	sessionId: string,
	mode: ImageStudioMode,
	attachmentId: number | null,
	messageId: string | null
): void {
	// Track the feedback event
	trackImageStudioImageFeedback( {
		feedback,
		attachmentId,
		mode,
	} );

	// Send feedback to the API
	if ( sessionId && messageId ) {
		apiFetch( {
			path: '/wpcom/v2/big-sky/v1/wp-orchestrator/' + encodeURIComponent( sessionId ) + '/rate',
			method: 'POST',
			data: {
				message_id: messageId,
				rating: feedback,
				big_sky_version:
					(
						window as unknown as {
							bigSkyInitialState?: { bigSkyVersion?: string };
						}
					 )?.bigSkyInitialState?.bigSkyVersion ?? '0',
				metadata: {
					image_url: imageUrl,
					mode,
				},
			},
		} );
	}
}

export const CanvasControls = ( {
	imageUrl,
	attachmentId,
	sessionId,
	mode,
	showFeedbackButtons,
	showImageActionsMenu = false,
	onSave,
	onRevertToOriginal,
}: CanvasControlsProps ) => {
	const [ selectedFeedback, setSelectedFeedback ] = useState< 'up' | 'down' | null >( null );

	// Get the last agent message ID from the store for feedback tracking
	const lastAgentMessageId = useSelect(
		( select ) => select( imageStudioStore ).getLastAgentMessageId(),
		[]
	);

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
			submitImageFeedback( imageUrl, feedback, sessionId, mode, attachmentId, lastAgentMessageId );
		},
		[ imageUrl, sessionId, mode, attachmentId, selectedFeedback, lastAgentMessageId ]
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
					label: __( 'Good response', 'big-sky' ),
					icon: <ThumbsUpIcon />,
					onClick: () => handleFeedback( 'up' ),
					tooltip: __( 'Good response', 'big-sky' ),
					disabled: selectedFeedback === 'down',
					pressed: selectedFeedback === 'up',
				},
				{
					id: 'feedback-down',
					label: __( 'Bad response', 'big-sky' ),
					icon: <ThumbsDownIcon />,
					onClick: () => handleFeedback( 'down' ),
					tooltip: __( 'Bad response', 'big-sky' ),
					disabled: selectedFeedback === 'up',
					pressed: selectedFeedback === 'down',
				},
			],
		} ),
		[ attachmentId, handleFeedback, selectedFeedback ]
	);

	return (
		<motion.div
			key={ `canvas-controls-${ attachmentId }` }
			className="canvas-controls"
			initial={ { opacity: 0 } }
			animate={ { opacity: 1 } }
			exit={ { opacity: 0 } }
			transition={ { duration: 0.3 } }
		>
			<div className="canvas-controls__left">
				{ showFeedbackButtons && <MessageActions message={ actionMessage } /> }
				{ showImageActionsMenu && (
					<ImageActionsMenu onSave={ onSave } onRevertToOriginal={ onRevertToOriginal } />
				) }
			</div>
			<div className="canvas-controls__right">
				<RevisionNavigator />
			</div>
		</motion.div>
	);
};
