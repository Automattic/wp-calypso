import clsx from 'clsx';
import { ForwardedRef, forwardRef } from 'react';
import Markdown from 'react-markdown';
import { Message } from '../../types/';
import CustomALink from './custom-a-link';
import DislikeFeedbackMessage from './dislike-feedback-message';
import ErrorMessage from './error-message';
import Sources from './sources';
import { uriTransformer } from './uri-transformer';
import { UserMessage } from './user-message';
import { MessageIndicators } from '.';

export const MessageContent = forwardRef<
	HTMLDivElement,
	{
		message: Message;
		messageHeader: React.ReactNode;
		onDislike: () => void;
		isDisliked?: boolean;
	} & MessageIndicators
>(
	(
		{
			isDisliked = false,
			message,
			messageHeader,
			onDislike,
			isLastErrorMessage,
			isLastFeedbackMessage,
			isLastMessage,
			isLastUserMessage,
		},
		ref: ForwardedRef< HTMLDivElement >
	) => {
		const isUser = message.role === 'user';
		const messageClasses = clsx(
			'odie-chatbox-message',
			isUser ? 'odie-chatbox-message-user' : 'odie-chatbox-message-wapuu',
			`odie-chatbox-message-${ message.type ?? 'message' }`,
			isLastMessage && 'odie-chatbox-message-last'
		);

		return (
			<div
				className="odie-chatbox-message-sources-container"
				ref={ ref }
				data-is-last-user-message={ isLastUserMessage }
				data-is-last-error-message={ isLastErrorMessage }
				data-is-last-feedback-message={ isLastFeedbackMessage }
				data-is-last-message={ isLastMessage }
			>
				<div className={ messageClasses }>
					{ messageHeader }
					{ message.type === 'error' && <ErrorMessage message={ message } /> }
					{ ( message.type === 'message' || ! message.type ) && (
						<UserMessage message={ message } onDislike={ onDislike } isDisliked={ isDisliked } />
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
		);
	}
);
