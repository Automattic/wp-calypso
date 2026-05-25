import { BigSkyIcon, cn } from '@automattic/agenttic-ui';
import { __ } from '@wordpress/i18n';
import { ShareReelAction } from './share-reel-action';
import { VideoFeedbackButtons } from './video-feedback-buttons';
import './style.scss';

export const GenerateLayout = ( {
	isAiProcessing,
	isPromptSent,
	videoUrl,
	onFeedback,
	onSubmitFeedbackText,
}: {
	isPromptSent: boolean;
	isAiProcessing: boolean;
	videoUrl?: string | null;
	onFeedback?: ( feedback: 'up' | 'down' ) => void;
	onSubmitFeedbackText?: ( feedbackText: string ) => Promise< void >;
} ) => {
	if ( videoUrl ) {
		return (
			<div
				className={ cn( 'image-studio-modal__generate-layout--video', {
					'is-ai-processing': isAiProcessing,
					'is-prompt-sent': isPromptSent,
				} ) }
			>
				<div className="image-studio-modal__generated-video-frame">
					<video
						className="image-studio-modal__generated-video"
						src={ videoUrl }
						aria-label={ __( 'Generated feature clip preview', __i18n_text_domain__ ) }
						controls
						loop
						muted
						playsInline
						preload="metadata"
					/>
				</div>
				<div className="image-studio-modal__video-actions-bar">
					<VideoFeedbackButtons
						videoUrl={ videoUrl }
						onFeedback={ onFeedback }
						onSubmitFeedbackText={ onSubmitFeedbackText }
					/>
					<ShareReelAction />
				</div>
			</div>
		);
	}

	return (
		<div
			className={ cn( 'image-studio-modal__generate-layout', {
				'is-ai-processing': isAiProcessing,
				'is-prompt-sent': isPromptSent,
			} ) }
		>
			<BigSkyIcon size={ 80 } />
			<h2>{ __( "Let's create!", __i18n_text_domain__ ) }</h2>
		</div>
	);
};
