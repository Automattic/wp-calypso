import clsx from 'clsx';
import Markdown from 'react-markdown';
import { useOdieAssistantContext } from '../../context';
import { zendeskMessageConverter } from '../../utils';
import ChatWithSupportLabel from '../chat-with-support';
import CustomALink from './custom-a-link';
import DislikeFeedbackMessage from './dislike-feedback-message';
import ErrorMessage from './error-message';
import Sources from './sources';
import { uriTransformer } from './uri-transformer';
import { UserMessage } from './user-message';
import type { ZendeskMessage, Message } from '../../types';

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
		`odie-chatbox-message-${ message.type ?? 'message' }`,
		shouldUseHelpCenterExperience &&
			message?.context?.flags?.show_ai_avatar === false &&
			`odie-chatbox-message-no-avatar`
	);
	const containerClasses = clsx(
		'odie-chatbox-message-sources-container',
		shouldUseHelpCenterExperience && isNextMessageFromSameSender && 'next-chat-message-same-sender'
	);

	const isMessageWithOnlyText =
		message.context?.flags?.hide_disclaimer_content ||
		message.context?.question_tags?.inquiry_type === 'user-is-greeting';

	// This will parse text messages sent from users to Zendesk.
	const parseTextMessage = ( message: Message ): Message => {
		const zendeskMessage = {
			type: 'text',
			text: message.content,
			role: message.role,
		} as ZendeskMessage;
		return zendeskMessageConverter( zendeskMessage );
	};

	const shouldParseMessage = () => {
		return message.type === 'message' && message.role !== 'bot';
	};

	// message type === message are messages being sent from users to zendesk.
	// They need to be parsed to markdown to appear nicely.
	const markdownMessageContent = shouldParseMessage() ? parseTextMessage( message ) : message;

	return (
		<>
			<div className={ containerClasses } data-is-message="true">
				<div className={ messageClasses }>
					{ message?.context?.flags?.show_ai_avatar !== false && messageHeader }
					{ message.type === 'error' && <ErrorMessage message={ message } /> }
					{ ( [ 'message', 'image', 'file', 'text' ].includes( message.type ) ||
						! message.type ) && (
						<UserMessage
							message={ markdownMessageContent }
							isDisliked={ isDisliked }
							isMessageWithoutEscalationOption={ isMessageWithOnlyText }
						/>
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
				{ ! isMessageWithOnlyText && <Sources message={ message } /> }
			</div>
			{ shouldUseHelpCenterExperience && displayChatWithSupportLabel && <ChatWithSupportLabel /> }
		</>
	);
};
