import clsx from 'clsx';
import Markdown from 'react-markdown';
import { Message } from '../../types/';
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
}: {
	message: Message;
	messageHeader: React.ReactNode;
	isDisliked?: boolean;
} ) => {
	const isUser = message.role === 'user';
	const messageClasses = clsx(
		'odie-chatbox-message',
		isUser ? 'odie-chatbox-message-user' : 'odie-chatbox-message-wapuu',
		`odie-chatbox-message-${ message.type ?? 'message' }`
	);

	return (
		<div className="odie-chatbox-message-sources-container" data-is-message="true">
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
	);
};
