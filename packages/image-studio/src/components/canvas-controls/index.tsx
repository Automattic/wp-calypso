/**
 * Canvas Controls Component
 *
 * Displays thumbs up/down feedback buttons overlaid on the bottom-left of the generated image.
 * Uses the Agenttic UI MessageActions component for consistent styling and behavior.
 * Shows a feedback text input popover when the thumbs down button is clicked.
 */
import { FeedbackInput } from '@automattic/agents-manager';
import { MessageActions, ThumbsDownIcon, ThumbsUpIcon } from '@automattic/agenttic-ui';
import { Popover, __unstableMotion as motion } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { type ImageStudioActions, store as imageStudioStore } from '../../store';
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
	onSubmitFeedbackText?: ( feedbackText: string ) => Promise< void >;
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
	onSubmitFeedbackText,
}: CanvasControlsProps ) => {
	// FORNO-348: tolerate an older registered image-studio store that pre-dates
	// FORNO-277's rating selectors/actions. No-op instead of crashing the modal.
	const selectedFeedback = useSelect(
		( select ) => {
			const selectors = select( imageStudioStore ) as unknown as {
				getImageRating?: ( id: number | null ) => 'up' | 'down' | null;
			};
			return selectors.getImageRating?.( attachmentId ) ?? null;
		},
		[ attachmentId ]
	);
	const { setImageRating } = useDispatch( imageStudioStore ) as Partial< ImageStudioActions >;
	const [ showFeedbackPopover, setShowFeedbackPopover ] = useState( false );
	const feedbackAnchorRef = useRef< HTMLDivElement | null >( null );

	// Close feedback popover when navigating to a different image
	useEffect( () => {
		setShowFeedbackPopover( false );
	}, [ imageUrl ] );

	const handleFeedback = useCallback(
		( feedback: 'up' | 'down' ) => {
			// Don't allow changing feedback once submitted for this image
			if ( selectedFeedback !== null || attachmentId === null ) {
				return;
			}

			// FORNO-348: skip tracking/popover when we can't persist the rating.
			if ( ! setImageRating ) {
				return;
			}

			setImageRating( attachmentId, feedback );
			trackImageStudioImageFeedback( { feedback, attachmentId, mode } );
			onFeedback?.( feedback );

			if ( feedback === 'down' && onSubmitFeedbackText ) {
				setShowFeedbackPopover( true );
			}
		},
		[ mode, attachmentId, selectedFeedback, onFeedback, onSubmitFeedbackText, setImageRating ]
	);

	const handleCloseFeedbackPopover = useCallback( () => {
		setShowFeedbackPopover( false );
	}, [] );

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
			<div className="canvas-controls__left" ref={ feedbackAnchorRef }>
				{ showFeedbackButtons && <MessageActions message={ actionMessage } /> }
				{ showImageActionsMenu && (
					<ImageActionsMenu onSave={ onSave } onRevertToOriginal={ onRevertToOriginal } />
				) }
				{ showFeedbackPopover && onSubmitFeedbackText && (
					<Popover
						className="canvas-controls__feedback-popover"
						placement="bottom-start"
						anchor={ feedbackAnchorRef.current }
						onClose={ handleCloseFeedbackPopover }
						variant="unstyled"
						offset={ 12 }
						shift
					>
						<FeedbackInput
							onSubmit={ onSubmitFeedbackText }
							onCancel={ handleCloseFeedbackPopover }
						/>
					</Popover>
				) }
			</div>
			<div className="canvas-controls__right">
				<RevisionNavigator />
			</div>
		</motion.div>
	);
};
