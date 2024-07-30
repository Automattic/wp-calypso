import clsx from 'clsx';
import { ForwardedRef, forwardRef } from 'react';
import Markdown from 'react-markdown';
import { useOdieAssistantContext } from '../../context';
import { Message } from '../../types/';
import CustomALink from './custom-a-link';
import DislikeFeedbackMessage from './dislike-feedback-message';
import ErrorMessage from './error-message';
import Sources from './sources';
import { uriTransformer } from './uri-transformer';
import { UserMessage } from './user-message';

export const MessageContent = forwardRef<
	HTMLDivElement,
	{
		message: Message;
		messageHeader: React.ReactNode;
		onDislike: () => void;
	}
>( ( { message, messageHeader, onDislike }, ref: ForwardedRef< HTMLDivElement > ) => {
	const { extraContactOptions } = useOdieAssistantContext();
	const isRequestingHumanSupport = message.context?.flags?.forward_to_human_support;
	const isUser = message.role === 'user';
	const messageClasses = clsx(
		'odie-chatbox-message',
		isUser ? 'odie-chatbox-message-user' : 'odie-chatbox-message-wapuu'
	);

	return (
		<div className="odie-chatbox-message-sources-container" ref={ ref }>
			<div className={ messageClasses }>
				{ messageHeader }
				{ message.type === 'error' && <ErrorMessage message={ message } /> }
				{ ( message.type === 'message' || ! message.type ) && (
					<UserMessage message={ message } onDislike={ onDislike } />
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
				{ isRequestingHumanSupport && extraContactOptions }
			</div>
			<Sources message={ message } />
		</div>
	);
} );
