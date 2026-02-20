/**
 * Canvas Controls Component
 *
 * Displays thumbs up/down feedback buttons overlaid on the bottom-left of the generated image.
 * Uses the Agenttic UI MessageActions component for consistent styling and behavior.
 */
import { MessageActions, ThumbsDownIcon, ThumbsUpIcon } from '@automattic/agenttic-ui';
import { __unstableMotion as motion } from '@wordpress/components';
import { useCallback, useEffect, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { trackImageStudioImageFeedback } from '../../utils/tracking';
import { ImageActionsMenu } from '../image-actions-menu';
import { RevisionNavigator } from './revision-navigator';
import type { ImageStudioMode } from '../../types';
import './style.scss';

interface CanvasControlsProps {
	imageUrl: string;
	attachmentId: number | null;
	mode: ImageStudioMode;
	showFeedbackButtons: boolean;
	showImageActionsMenu?: boolean;
	onSave?: () => void;
	onRevertToOriginal?: () => void;
	onFeedback?: ( feedback: 'up' | 'down' ) => void;
}

export const CanvasControls = ( {
	imageUrl,
	attachmentId,
	mode,
	showFeedbackButtons,
	showImageActionsMenu = false,
	onSave,
	onRevertToOriginal,
	onFeedback,
}: CanvasControlsProps ) => {
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
			trackImageStudioImageFeedback( { feedback, attachmentId, mode } );
			onFeedback?.( feedback );
		},
		[ mode, attachmentId, selectedFeedback, onFeedback ]
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
					label: __( 'Good response', __i18n_text_domain__ ),
					icon: <ThumbsUpIcon />,
					onClick: () => handleFeedback( 'up' ),
					tooltip: __( 'Good response', __i18n_text_domain__ ),
					disabled: selectedFeedback === 'down',
					pressed: selectedFeedback === 'up',
				},
				{
					id: 'feedback-down',
					label: __( 'Bad response', __i18n_text_domain__ ),
					icon: <ThumbsDownIcon />,
					onClick: () => handleFeedback( 'down' ),
					tooltip: __( 'Bad response', __i18n_text_domain__ ),
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
