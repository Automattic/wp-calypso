import classnames from 'classnames';
import { lazy, RefObject, Suspense, useState } from 'react';
import type { Message } from '../types';

import './style.scss';

// eslint-disable-next-line import/no-extraneous-dependencies
const ReactMarkdown = lazy( () => import( 'react-markdown' ) );

type ChatMessageProps = {
	message: Message;
	isLast: boolean;
	messageEndRef: RefObject< HTMLDivElement >;
};

const ChatMessage = ( { message, isLast, messageEndRef }: ChatMessageProps ) => {
	const [ liked, setLiked ] = useState( false );
	const [ disliked, setDisliked ] = useState( false );

	const isUser = message.role === 'user';

	const onLike = () => {
		if ( liked ) {
			setLiked( false );
			setDisliked( false );
			return;
		}
		setLiked( true );
		setDisliked( false );
	};

	const onDislike = () => {
		if ( disliked ) {
			setLiked( false );
			setDisliked( false );
			return;
		}
		setLiked( false );
		setDisliked( true );
	};

	return (
		<div
			ref={ isLast ? messageEndRef : null }
			className={ `chatbox-message ${ isUser ? 'user' : 'wapuu' }` }
		>
			<Suspense fallback={ null }>
				<ReactMarkdown children={ message.content } />
			</Suspense>
			{ ! isUser && (
				<div className="message-actions">
					<button
						aria-label="Like this message"
						className={ classnames( 'message-action', 'dashicons', {
							'dashicons-thumbs-up': true,
							'active-like': liked,
							hide: disliked,
						} ) }
						disabled={ disliked }
						onClick={ onLike }
					></button>
					<button
						aria-label="Dislike this message"
						className={ classnames( 'message-action', 'dashicons', {
							'dashicons-thumbs-down': true,
							'active-dislike': disliked,
							hide: liked,
						} ) }
						disabled={ liked }
						onClick={ onDislike }
					></button>
				</div>
			) }
		</div>
	);
};

export default ChatMessage;
