import { BigSkyIcon, cn } from '@automattic/agenttic-ui';
import { __ } from '@wordpress/i18n';
import './style.scss';

export const GenerateLayout = ( {
	isAiProcessing,
	isPromptSent,
}: {
	isPromptSent: boolean;
	isAiProcessing: boolean;
} ) => {
	return (
		<div
			className={ cn( 'image-studio-modal__generate-layout', {
				'is-ai-processing': isAiProcessing,
				'is-prompt-sent': isPromptSent,
			} ) }
		>
			<BigSkyIcon size={ 80 } />
			<h2>{ __( "Let's create!", 'big-sky' ) }</h2>
		</div>
	);
};
