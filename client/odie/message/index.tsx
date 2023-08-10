import { Spinner } from '@wordpress/components';
import { RefObject } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import CustomALink from './custom-a-link';
import { LikeDislikeButtons } from './like-dislike-buttons';
import { uriTransformer } from './uri-transformer';
import type { Message } from '../types';

import './style.scss';

type ChatMessageProps = {
	message: Message;
	isLast: boolean;
	messageEndRef: RefObject< HTMLDivElement >;
};

const ChatMessage = ( { message, isLast, messageEndRef }: ChatMessageProps ) => {
	const isUser = message.role === 'user';

	return (
		<div
			ref={ isLast ? messageEndRef : null }
			className={ `odie-chatbox-message ${
				isUser ? 'odyssus-chatbox-message-user' : 'odyssus-chatbox-message-wapuu'
			}` }
		>
			{ message.type === 'placeholder' ? (
				<Spinner />
			) : (
				<>
					<AsyncLoad
						require="react-markdown"
						placeholder={ null }
						transformLinkUri={ uriTransformer }
						components={ {
							a: CustomALink,
						} }
					>
						{ message.content }
					</AsyncLoad>
					<LikeDislikeButtons isUser={ isUser } messageType={ message.type } />
				</>
			) }
		</div>
	);
};

export default ChatMessage;
