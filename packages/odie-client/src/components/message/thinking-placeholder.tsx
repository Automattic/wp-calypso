import { __ } from '@wordpress/i18n';
import { WapuuAvatar } from '../../assets';
import WapuuThinkingNew from '../../assets/wapuu-thinking_new.svg';

export const ThinkingPlaceholder = () => {
	return (
		<div className="message-header bot">
			<WapuuAvatar />
			<img
				src={ WapuuThinkingNew }
				alt={ __( 'Loading state, awaiting response from AI', __i18n_text_domain__ ) }
				className="odie-chatbox-thinking-icon"
			/>
		</div>
	);
};
