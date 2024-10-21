import { __ } from '@wordpress/i18n';
import WapuuAvatarSquared from '../../assets/wapuu-squared-avatar.svg';
import WapuuThinking from '../../assets/wapuu-thinking.svg';

export const ThinkingPlaceholder = () => {
	return (
		<div className="message-header bot">
			<img
				src={ WapuuAvatarSquared }
				alt={ __( 'AI profile picture', __i18n_text_domain__ ) }
				className="odie-chatbox-message-avatar thinking"
			/>
			<img
				src={ WapuuThinking }
				alt={ __( 'Loading state, awaiting response from AI', __i18n_text_domain__ ) }
				className="odie-chatbox-thinking-icon"
			/>
		</div>
	);
};
