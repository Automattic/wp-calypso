import { BigSkyIcon, cn } from '@automattic/agenttic-ui';
import { __ } from '@wordpress/i18n';
import './style.scss';

export const GenerateLayout = ( {
	isAiProcessing,
	isPromptSent,
	videoUrl,
}: {
	isPromptSent: boolean;
	isAiProcessing: boolean;
	videoUrl?: string | null;
} ) => {
	// Once a video URL is available we swap the placeholder for an HTML5 player
	// pinned to a 9:16 frame (the only AR Veo produces today). VideoPress is the
	// follow-up — see the comment in components/index.tsx where this is wired.
	if ( videoUrl ) {
		return (
			<div
				className={ cn( 'image-studio-modal__generate-layout--video', {
					'is-ai-processing': isAiProcessing,
					'is-prompt-sent': isPromptSent,
				} ) }
			>
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
