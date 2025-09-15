import { ThinkingMessage } from '@automattic/agenttic-ui';
import { __ } from '@wordpress/i18n';

export const TypingPlaceholder = () => {
	return (
		<div className="odie-chatbox-typing-placeholder agenttic">
			<ThinkingMessage content={ __( 'Typing…', __i18n_text_domain__ ) } />
		</div>
	);
};
