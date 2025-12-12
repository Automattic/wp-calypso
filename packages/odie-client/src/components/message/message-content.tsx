import { zendeskMessageConverter } from '@automattic/zendesk-client';
import clsx from 'clsx';
import { useOdieAssistantContext } from '../../context';
import { hasSubmittedCSATRating, isCSATMessage } from '../../utils';
import { FeedbackForm } from './feedback-form';
import { IntroductionMessage } from './introduction-message/introduction-message';
import MarkdownOrChildren from './mardown-or-children';
import { UserMessage } from './user-message';
import type { Message } from '../../types';
import type { ZendeskMessage } from '@automattic/zendesk-client';

export const MessageContent = ( {
	message,
	header,
}: {
	message: Message;
	header?: React.ReactNode;
} ) => {
	const isFeedbackMessage = isCSATMessage( message );
	const messageClasses = clsx(
		'odie-chatbox-message',
		'agenttic',
		`odie-chatbox-message-${ message.role }`,
		`odie-chatbox-message-${ message.type ?? 'message' }`,
		// `received` timestamp is assigned on the server. it's existence means the message was successfully sent.
		// Checking for the temporary id means the message is a ZD message.
		{
			'is-sending': message.role === 'user' && ! message.received && message.metadata?.temporary_id,
		},
		{
			'odie-chatbox-message-conversation-feedback': isFeedbackMessage,
		}
	);
	const { chat } = useOdieAssistantContext();

	const displayCSAT = ! hasSubmittedCSATRating( chat );

	const isMessageWithEscalationOption =
		message.role === 'bot' &&
		! (
			message.context?.flags?.hide_disclaimer_content ||
			message.context?.flags?.failed_zendesk_connection ||
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
		<div className={ messageClasses }>
			{ header && <div className="message-header business">{ header }</div> }
			{ message.type === 'error' && <MarkdownOrChildren messageContent={ message.content } /> }
			{ ( [ 'message', 'image', 'image-placeholder', 'file', 'text' ].includes( message.type ) ||
				! message.type ) && (
				<UserMessage
					message={ markdownMessageContent }
					isMessageWithEscalationOption={ isMessageWithEscalationOption }
				/>
			) }
			{ message.type === 'introduction' && <IntroductionMessage content={ message.content } /> }
			{ displayCSAT && isFeedbackMessage && message.feedbackOptions && (
				<FeedbackForm chatFeedbackOptions={ message?.feedbackOptions } />
			) }
		</div>
	);
};
