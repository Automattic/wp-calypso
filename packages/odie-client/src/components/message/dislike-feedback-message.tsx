import { useI18n } from '@wordpress/react-i18n';
import Markdown from 'react-markdown';
import { useOdieAssistantContext } from '../../context';
import CustomALink from './custom-a-link';
import { uriTransformer } from './uri-transformer';

export const DislikeFeedbackMessage = () => {
	const { extraContactOptions } = useOdieAssistantContext();
	const { _x } = useI18n();
	return (
		<>
			<Markdown
				urlTransform={ uriTransformer }
				components={ {
					a: CustomALink,
				} }
			>
				{
					/* translators: Message displayed when the user dislikes a message from the bot */
					_x(
						'I’m sorry my last response didn’t meet your expectations! Here’s some other ways to get more in-depth help:',
						'Message displayed when the user dislikes a message from the bot',
						__i18n_text_domain__
					)
				}
			</Markdown>
			{ extraContactOptions }
		</>
	);
};

export default DislikeFeedbackMessage;
