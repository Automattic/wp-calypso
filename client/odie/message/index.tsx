import { Spinner } from '@wordpress/components';
import { Icon, page as pageIcon } from '@wordpress/icons';
import classnames from 'classnames';
import { useState, useEffect, RefObject, useRef } from 'react';
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
	const { addMessage: sendOdieMessage } = useOdieAssistantContext();
	const messageClasses = classnames(
		'odie-chatbox-message',
		isUser ? 'odie-chatbox-message-user' : 'odie-chatbox-message-wapuu',
		{
			'odie-full-width-message': message.type === 'help-link',
			'odie-introduction-message': message.type === 'introduction',
			'odie-simulate-typing': message.simulateTyping,
		}
	);

	const handleHelpLinkClick = async () => {
		await sendOdieMessage( {
			role: 'user',
			type: 'message',
			content: message.meta?.message ?? '',
		} );
	};

	const [ realTimeMessage, setRealTimeMessage ] = useState( '' );
	const currentIndex = useRef( 0 );

	useEffect( () => {
		if ( message.type === 'message' && ! isUser && message.simulateTyping ) {
			const words = message.content.split( ' ' );

			const typeWord = () => {
				if ( currentIndex.current < words.length ) {
					// Append a space and the current word from the array
					setRealTimeMessage(
						( prevMessage ) => prevMessage + ' ' + words[ currentIndex.current ]
					);

					currentIndex.current++; // Update the index

					const delay = Math.random() * ( 66 - 33 ) + 33; // Randomize delay between 330ms and 660ms
					setTimeout( typeWord, delay );
				}
			};

			// Initialize with the first word and reset index to start from the second word
			setRealTimeMessage( words[ 0 ] );
			currentIndex.current = 1; // Start from the second word

			const initialDelay = Math.random() * ( 66 - 33 ) + 33; // Randomize initial delay
			setTimeout( typeWord, initialDelay ); // Initiate the typing simulation
		} else if ( message.type === 'message' && ! isUser && ! message.simulateTyping ) {
			setRealTimeMessage( message.content ); // If not simulating typing but it's a message from not the user, show the full message
		}
	}, [ message, isUser ] );

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
						{ isUser || ! message.simulateTyping ? message.content : realTimeMessage }
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
				<div className="odie-introduction-message-content">
					<img src={ WapuuAvatar } alt="Wapuu profile" className="odie-chatbox-message-avatar" />
					<div className="odie-chatbox-introduction-message">{ message.content }</div>
				</div>
			) }
		</div>
	);
};

export default ChatMessage;
