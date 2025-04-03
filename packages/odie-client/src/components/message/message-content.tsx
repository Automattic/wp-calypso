import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { zendeskMessageConverter } from '../../utils';
import ChatWithSupportLabel from '../chat-with-support';
import ErrorMessage from './error-message';
import { FeedbackContent } from './feedback-content';
import { IntroductionMessage } from './introduction-message';
import { UserMessage } from './user-message';
import type { ZendeskMessage, Message } from '../../types';

export const MessageContent = ( {
	isDisliked = false,
	message,
	messageHeader,
	isNextMessageFromSameSender,
	displayChatWithSupportLabel,
	displayChatWithSupportEndedLabel,
}: {
	message: Message;
	messageHeader: React.ReactNode;
	isDisliked?: boolean;
	isNextMessageFromSameSender?: boolean;
	displayChatWithSupportLabel?: boolean;
	displayChatWithSupportEndedLabel?: boolean;
} ) => {
	const { __ } = useI18n();
	const messageClasses = clsx(
		'odie-chatbox-message',
		`odie-chatbox-message-${ message.role }`,
		`odie-chatbox-message-${ message.type ?? 'message' }`,
		message?.context?.flags?.show_ai_avatar === false && 'odie-chatbox-message-no-avatar'
	);
	const isFeedbackMessage = message.type === 'conversation-feedback' && message?.meta?.feedbackUrl;

	const containerClasses = clsx(
		'odie-chatbox-message-sources-container',
		( isNextMessageFromSameSender || isFeedbackMessage ) && 'next-chat-message-same-sender'
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
					{ ( [ 'message', 'image', 'image-placeholder', 'file', 'text' ].includes(
						message.type
					) ||
						! message.type ) && (
						<UserMessage
							message={ markdownMessageContent }
							isDisliked={ isDisliked }
							isMessageWithoutEscalationOption={ isMessageWithOnlyText }
						/>
					) }
					{ message.type === 'introduction' && <IntroductionMessage content={ message.content } /> }
					{ isFeedbackMessage && (
						<FeedbackContent content={ message.content } meta={ message?.meta } />
					) }
				</div>
			</div>

			{ displayChatWithSupportLabel && (
				<ChatWithSupportLabel
					labelText={ __( 'Chat with support started', __i18n_text_domain__ ) }
				/>
			) }
			{ displayChatWithSupportEndedLabel && (
				<ChatWithSupportLabel labelText={ __( 'Chat with support ended', __i18n_text_domain__ ) } />
			) }
		</>
	);
};
