import { FeedbackInput } from '@automattic/agents-manager';
import { MessageActions, ThumbsDownIcon, ThumbsUpIcon } from '@automattic/agenttic-ui';
import { Popover } from '@wordpress/components';
import { useCallback, useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { ImageStudioMode } from '../../../types';
import { trackImageStudioImageFeedback } from '../../../utils/tracking';
import type { JSX } from 'react';
import './style.scss';

interface VideoFeedbackButtonsProps {
	videoUrl: string;
	onFeedback?: ( feedback: 'up' | 'down' ) => void;
	onSubmitFeedbackText?: ( feedbackText: string ) => Promise< void >;
}

export const VideoFeedbackButtons = ( {
	videoUrl,
	onFeedback,
	onSubmitFeedbackText,
}: VideoFeedbackButtonsProps ): JSX.Element => {
	const [ selectedFeedback, setSelectedFeedback ] = useState< 'up' | 'down' | null >( null );
	const [ showFeedbackPopover, setShowFeedbackPopover ] = useState( false );
	const anchorRef = useRef< HTMLDivElement | null >( null );

	useEffect( () => {
		setSelectedFeedback( null );
		setShowFeedbackPopover( false );
	}, [ videoUrl ] );

	const handleFeedback = useCallback(
		( feedback: 'up' | 'down' ) => {
			if ( selectedFeedback !== null ) {
				return;
			}
			setSelectedFeedback( feedback );
			trackImageStudioImageFeedback( {
				feedback,
				attachmentId: null,
				mode: ImageStudioMode.Generate,
			} );
			onFeedback?.( feedback );
			if ( feedback === 'down' && onSubmitFeedbackText ) {
				setShowFeedbackPopover( true );
			}
		},
		[ selectedFeedback, onFeedback, onSubmitFeedbackText ]
	);

	const handleClosePopover = useCallback( () => setShowFeedbackPopover( false ), [] );

	const actionMessage = useMemo(
		() => ( {
			id: `video_${ videoUrl }`,
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
		[ videoUrl, handleFeedback, selectedFeedback ]
	);

	return (
		<div className="image-studio-video-feedback-buttons" ref={ anchorRef }>
			<MessageActions message={ actionMessage } />
			{ showFeedbackPopover && onSubmitFeedbackText && (
				<Popover
					className="image-studio-video-feedback-buttons__popover"
					placement="top-start"
					anchor={ anchorRef.current }
					onClose={ handleClosePopover }
					variant="unstyled"
					offset={ 12 }
					shift
				>
					<FeedbackInput onSubmit={ onSubmitFeedbackText } onCancel={ handleClosePopover } />
				</Popover>
			) }
		</div>
	);
};
