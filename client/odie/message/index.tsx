import { Spinner } from '@wordpress/components';
import { Icon, page as pageIcon, pencil } from '@wordpress/icons';
import classnames from 'classnames';
import { RefObject } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import { useOdieAssistantContext } from '../context';
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

	// TODO: Temporarily don't send anything yet to the server.
	// const { mutateAsync: sendOdieMessage } = useOdieSendMessage();

	const { addMessage: sendOdieMessage } = useOdieAssistantContext();
	const messageClasses = classnames(
		'odie-chatbox-message',
		isUser ? 'odie-chatbox-message-user' : 'odie-chatbox-message-wapuu',
		{
			'full-width-message': message.type === 'help-link',
		}
	);

	const handleHelpLinkClick = async () => {
		await sendOdieMessage( {
			role: 'user',
			type: 'message',
			content: message.meta?.message ?? '',
		} );
	};

	return (
		<div ref={ isLast ? messageEndRef : null } className={ messageClasses }>
			{ message.type === 'placeholder' && <Spinner /> }
			{ message.type === 'message' && (
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
			{ message.type === 'help-link' && (
				// eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
				<div className="odie-chatbox-help-link" onClick={ handleHelpLinkClick }>
					<Icon
						className="odie-chatbox-message-help-icon"
						width={ 32 }
						height={ 32 }
						icon={ pageIcon }
					/>
					<div className="odie-chatbox-help-link__content">{ message.content }</div>
					<Icon
						className="odie-chatbox-message-help-icon"
						width={ 32 }
						height={ 32 }
						icon={ pencil }
					/>
				</div>
			) }
		</div>
	);
};

export default ChatMessage;
