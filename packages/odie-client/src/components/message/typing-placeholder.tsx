import { __ } from '@wordpress/i18n';
import TypingAnimation from '../../assets/zendesk-typing-animation.svg';

export const TypingPlaceholder = () => {
	return (
		<div className="odie-chatbox-typing-placeholder">
			<img
				src={ TypingAnimation }
				alt={ __( 'Happiness Engineer is typing', __i18n_text_domain__ ) }
				className="odie-chatbox-thinking-icon"
			/>
		</div>
	);
};
