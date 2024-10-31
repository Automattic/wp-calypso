import clsx from 'clsx';
import { ForwardedRef, forwardRef } from 'react';
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
import { MessageIndicators } from '.';

export const MessageContent = forwardRef<
	HTMLDivElement,
	{
		message: Message;
		messageHeader: React.ReactNode;
		isDisliked?: boolean;
	} & MessageIndicators
>(
	(
		{
			isDisliked = false,
			message,
			messageHeader,
			isLastErrorMessage,
			isLastFeedbackMessage,
			isLastMessage,
			isLastUserMessage,
			isNextMessageFromSameSender,
			displayChatWithSupportLabel,
		},
		ref: ForwardedRef< HTMLDivElement >
	) => {
		const { shouldUseHelpCenterExperience } = useOdieAssistantContext();

		const isMessageWithOnlyText =
			message.context?.flags?.hide_disclaimer_content ||
			message.context?.question_tags?.inquiry_type === 'user-is-greeting';

		const messageClasses = clsx(
			'odie-chatbox-message',
			`odie-chatbox-message-${ message.role }`,
			`odie-chatbox-message-${ message.type ?? 'message' }`,
			isLastMessage && 'odie-chatbox-message-last'
		);
		const containerClasses = clsx(
			'odie-chatbox-message-sources-container',
			shouldUseHelpCenterExperience &&
				isNextMessageFromSameSender &&
				'next-chat-message-same-sender'
		);
		return (
			<>
				<div
					className={ containerClasses }
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
							<UserMessage
								message={ message }
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
	}
);
