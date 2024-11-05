import clsx from 'clsx';
import Markdown from 'react-markdown';
import { useOdieAssistantContext } from '../../context';
import { Message } from '../../types/';
import ChatWithSupportLabel from '../chat-with-support';
import CustomALink from './custom-a-link';
import DislikeFeedbackMessage from './dislike-feedback-message';
import ErrorMessage from './error-message';
import Sources from './sources';
import { uriTransformer } from './uri-transformer';
import { UserMessage } from './user-message';

export const MessageContent = ( {
	isDisliked = false,
	message,
	messageHeader,
	isNextMessageFromSameSender,
	displayChatWithSupportLabel,
}: {
	message: Message;
	messageHeader: React.ReactNode;
	isDisliked?: boolean;
	isNextMessageFromSameSender?: boolean;
	displayChatWithSupportLabel?: boolean;
} ) => {
	const { shouldUseHelpCenterExperience } = useOdieAssistantContext();
	const messageClasses = clsx(
		'odie-chatbox-message',
		`odie-chatbox-message-${ message.role }`,
		`odie-chatbox-message-${ message.type ?? 'message' }`
	);
	const containerClasses = clsx(
		'odie-chatbox-message-sources-container',
		shouldUseHelpCenterExperience && isNextMessageFromSameSender && 'next-chat-message-same-sender'
	);

	return (
		<>
			<div className={ containerClasses } data-is-message="true">
				<div className={ messageClasses }>
					{ messageHeader }
					{ message.type === 'error' && <ErrorMessage message={ message } /> }
					{ ( message.type === 'message' || ! message.type ) && (
						<UserMessage message={ message } isDisliked={ isDisliked } />
					) }
					{ message.type === 'introduction' && (
						<div className="odie-introduction-message-content">
							<div className="odie-chatbox-introduction-message">
								<Markdown
									urlTransform={ uriTransformer }
									components={ {
										a: CustomALink,
									} }
								>
									{ message.content }
								</Markdown>
							</div>
						</div>
					) }
					{ message.type === 'dislike-feedback' && <DislikeFeedbackMessage /> }
				</div>
				<Sources message={ message } />
			</div>
			{ shouldUseHelpCenterExperience && displayChatWithSupportLabel && <ChatWithSupportLabel /> }
		</>
	);
};
