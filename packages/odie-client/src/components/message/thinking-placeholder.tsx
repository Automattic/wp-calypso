import { __ } from '@wordpress/i18n';
import { WapuuAvatar } from '../../assets';
import WapuuAvatarSquared from '../../assets/wapuu-squared-avatar.svg';
import WapuuThinking from '../../assets/wapuu-thinking.svg';
import WapuuThinkingNew from '../../assets/wapuu-thinking_new.svg';
import { useOdieAssistantContext } from '../../context';

export const ThinkingPlaceholder = () => {
	const { shouldUseHelpCenterExperience } = useOdieAssistantContext();
	return (
		<div className="message-header bot">
			{ shouldUseHelpCenterExperience ? (
				<>
					<WapuuAvatar />
					<img
						src={ WapuuThinkingNew }
						alt={ __( 'Loading state, awaiting response from AI', __i18n_text_domain__ ) }
						className="odie-chatbox-thinking-icon"
					/>
				</>
			) : (
				<>
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
				</>
			) }
		</div>
	);
};
