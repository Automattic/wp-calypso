import classnames from 'classnames';
import { RefObject, useState } from 'react';
import AsyncLoad from 'calypso/components/async-load';
import type { Message } from '../types';

import './style.scss';

type ChatMessageProps = {
	message: Message;
	isLast: boolean;
	messageEndRef: RefObject< HTMLDivElement >;
};

const ChatMessage = ( { message, isLast, messageEndRef }: ChatMessageProps ) => {
	const [ reaction, setReaction ] = useState< null | 'liked' | 'disliked' >( null );

	const isUser = message.role === 'user';

	const onLike = () => {
		if ( reaction === 'liked' ) {
			setReaction( null );
			return;
		}
		setReaction( 'liked' );
	};

	const onDislike = () => {
		if ( reaction === 'disliked' ) {
			setReaction( null );
			return;
		}
		setReaction( 'disliked' );
	};

	return (
		<div
			ref={ isLast ? messageEndRef : null }
			className={ `odysseus-chatbox-message ${
				isUser ? 'odyssus-chatbox-message-user' : 'odyssus-chatbox-message-wapuu'
			}` }
		>
			<AsyncLoad require="react-markdown" placeholder={ null }>
				{ message.content }
			</AsyncLoad>
			{ ! isUser && message.type !== 'error' && (
				<div className="odysseus-chatbox-message-actions">
					<button
						aria-label="Like this message"
						className={ classnames( 'odysseus-chatbox-message-action', 'dashicons', {
							'dashicons-thumbs-up': true,
							'odysseus-chatbox-message-active-like': reaction === 'liked',
							'odysseus-chatbox-message-hide': reaction === 'disliked',
						} ) }
						disabled={ reaction === 'disliked' }
						onClick={ onLike }
					></button>
					<button
						aria-label="Dislike this message"
						className={ classnames( 'odysseus-chatbox-message-action', 'dashicons', {
							'dashicons-thumbs-down': true,
							'odysseus-chatbox-message-active-dislike': reaction === 'disliked',
							'odysseus-chatbox-message-hide': reaction === 'liked',
						} ) }
						disabled={ reaction === 'liked' }
						onClick={ onDislike }
					></button>
				</div>
			) }
		</div>
	);
};

export default ChatMessage;
