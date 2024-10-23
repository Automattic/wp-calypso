import { __ } from '@wordpress/i18n';
import Markdown from 'react-markdown';
import { WapuuAvatar } from '../../assets/wapuu-avatar';
import { useOdieAssistantContext } from '../../context';
import CustomALink from './custom-a-link';
import { GetSupport } from './get-support';
import { uriTransformer } from './uri-transformer';

export const DislikeFeedbackMessage = () => {
	const { shouldUseHelpCenterExperience, extraContactOptions } = useOdieAssistantContext();

	return (
		<>
			<div className="message-header bot">
				<WapuuAvatar className="odie-chatbox-message-avatar" />
				<strong className="message-header-name"></strong>
			</div>
			<div className="odie-chatbox-dislike-feedback-message">
				<Markdown
					urlTransform={ uriTransformer }
					components={ {
						a: CustomALink,
					} }
				>
					{ __(
						'Would you like to contact our support team? Select an option below:',
						__i18n_text_domain__
					) }
				</Markdown>
			</div>
			{ shouldUseHelpCenterExperience ? <GetSupport /> : extraContactOptions }
		</>
	);
};

export default DislikeFeedbackMessage;
