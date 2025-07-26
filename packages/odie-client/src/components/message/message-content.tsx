import { useI18n } from '@wordpress/react-i18n';
import clsx from 'clsx';
import { isCSATMessage, zendeskMessageConverter } from '../../utils';
import ChatWithSupportLabel from '../chat-with-support';
import { FeedbackForm } from './feedback-form';
import { IntroductionMessage } from './introduction-message';
import MarkdownOrChildren from './mardown-or-children';
import { UserMessage } from './user-message';
import type { ZendeskMessage, Message } from '../../types';

export const MessageContent = ( {
	isDisliked = false,
	message,
	messageHeader,
	isNextMessageFromSameSender,
	displayChatWithSupportLabel,
	displayChatWithSupportEndedLabel,
	displayCSAT,
}: {
	message: Message;
	messageHeader: React.ReactNode;
	isDisliked?: boolean;
	isNextMessageFromSameSender?: boolean;
	displayChatWithSupportLabel?: boolean;
	displayChatWithSupportEndedLabel?: boolean;
	displayCSAT?: boolean;
} ) => {
	const { __ } = useI18n();
	const isFeedbackMessage = isCSATMessage( message );
	const messageClasses = clsx(
		'odie-chatbox-message',
		`odie-chatbox-message-${ message.role }`,
		`odie-chatbox-message-${ message.type ?? 'message' }`,
		{
			'odie-chatbox-message-conversation-feedback': isFeedbackMessage,
			'odie-chatbox-message-no-avatar': message?.context?.flags?.show_ai_avatar === false,
		}
	);

	const containerClasses = clsx( 'odie-chatbox-message-sources-container', {
		'next-chat-message-same-sender': isNextMessageFromSameSender,
	} );

	const isMessageWithEscalationOption =
		message.role === 'bot' &&
		! (
			message.context?.flags?.hide_disclaimer_content ||
			message.context?.question_tags?.inquiry_type === 'user-is-greeting'
		);

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
			{ isFeedbackMessage && (
				<ChatWithSupportLabel labelText={ __( 'Chat with support ended', __i18n_text_domain__ ) } />
			) }
			<div className={ containerClasses } data-is-message="true">
				<div className={ messageClasses }>
					{ message?.context?.flags?.show_ai_avatar !== false && messageHeader }
					{ message.type === 'error' && <MarkdownOrChildren messageContent={ message.content } /> }
					{ ( [ 'message', 'image', 'image-placeholder', 'file', 'text' ].includes(
						message.type
					) ||
						! message.type ) && (
						<UserMessage
							message={ markdownMessageContent }
							isDisliked={ isDisliked }
							isMessageWithEscalationOption={ isMessageWithEscalationOption }
						/>
					) }
					{ message.type === 'introduction' && <IntroductionMessage content={ message.content } /> }
					{ displayCSAT && isFeedbackMessage && message.feedbackOptions && (
						<FeedbackForm chatFeedbackOptions={ message?.feedbackOptions } />
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
