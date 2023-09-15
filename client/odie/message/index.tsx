import { Spinner } from '@wordpress/components';
import { Icon, page as pageIcon } from '@wordpress/icons';
import classnames from 'classnames';
import { RefObject } from 'react';
import WapuuAvatar from 'calypso/assets/images/odie/wapuu-avatar.svg';
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
			'odie-full-width-message': message.type === 'help-link',
			'odie-introduction-message': message.type === 'introduction',
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
				</div>
			) }
			{ message.type === 'introduction' && (
				<>
					<div className="odie-introduction-message-content">
						<img src={ WapuuAvatar } alt="Wapuu profile" className="odie-chatbox-message-avatar" />
						<div className="odie-chatbox-introduction-message">{ message.content }</div>
					</div>
				</>
			) }
		</div>
	);
};

export default ChatMessage;
