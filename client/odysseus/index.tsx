import { TextControl, Button } from '@wordpress/components';
import classnames from 'classnames';
import { useRef, useEffect, useState } from 'react';
import { useOdysseusAssistantContext } from './context';
import { useOdysseusGetChatQuery, useOddyseusSendMessage } from './query';
import WapuuRibbon from './wapuu-ribbon';

import './style.scss';

const OdysseusAssistant = () => {
	const { lastNudge, chat, isLoadingChat, addMessage, setMessages } = useOdysseusAssistantContext();
	const [ input, setInput ] = useState( '' );
	const [ isVisible, setIsVisible ] = useState( false );
	const [ isLoading, setIsLoading ] = useState( false );
	const [ isNudging, setIsNudging ] = useState( false );
	const { mutateAsync: sendOdysseusMessage } = useOddyseusSendMessage();
	const { data: chatData } = useOdysseusGetChatQuery( chat.chat_id ?? null );

	useEffect( () => {
		if ( isLoadingChat ) {
			setMessages( [
				{ content: 'Remembering any previous conversation...', role: 'bot', type: 'message' },
			] );
		} else if ( ! chat ) {
			setMessages( [
				{ content: 'Hello, I am Wapuu! Your personal assistant.', role: 'bot', type: 'message' },
			] );
		} else if ( chat ) {
			setMessages( chat.messages );
		}
	}, [ chat, isLoadingChat, setMessages, chat.messages ] );

	useEffect( () => {
		if ( chatData ) {
			if ( chat.messages.length !== chatData.messages.length ) {
				const countNewMessages = chatData.messages.length - chat.messages.length;
				const newMessages = chatData.messages.slice( -countNewMessages );
				newMessages.forEach( ( message ) => {
					addMessage( message );
				} );
			}
		}
	}, [ chat, chatData, addMessage ] );

	const environmentBadge = document.querySelector( 'body > .environment-badge' );

	const messagesEndRef = useRef< HTMLDivElement | null >( null );

	useEffect( () => {
		messagesEndRef.current?.scrollIntoView( { behavior: 'smooth' } );
	}, [ chat.messages ] );

	useEffect( () => {
		if ( lastNudge ) {
			setMessages( [
				{
					content: lastNudge.initialMessage,
					role: 'bot',
					type: 'message',
				},
			] );

			setIsNudging( true );
			const timeoutId = setTimeout( () => {
				setIsNudging( false );
			}, 2000 );

			return () => {
				clearTimeout( timeoutId );
			};
		}
	}, [ lastNudge, setMessages ] );

	const handleMessageChange = ( text: string ) => {
		setInput( text );
	};

	const handleSendMessage = async () => {
		try {
			setIsLoading( true );
			addMessage( {
				content: input,
				role: 'user',
				type: 'message',
			} );

			setInput( '' );
			const response = await sendOdysseusMessage( {
				message: { content: input, role: 'user', type: 'message' },
			} );

			addMessage( {
				content: response.messages[ 0 ].content,
				role: 'bot',
				type: 'message',
			} );
		} catch ( e ) {
			addMessage( {
				content:
					"Wapuu oopsie! 😺 My bad, but even cool pets goof. Let's laugh it off! 🎉, ask me again as I forgot what you said!",
				role: 'bot',
				type: 'message',
			} );
		} finally {
			setIsLoading( false );
		}
	};

	const handleToggleVisibility = () => {
		setIsVisible( ! isVisible );
	};

	function handleKeyDown( event: React.KeyboardEvent< HTMLInputElement > ) {
		if ( event.key === 'Enter' || event.keyCode === 13 ) {
			// Prevent a newline from being entered into the textbox
			event.preventDefault();

			handleSendMessage();
		}
	}

	function handleFormSubmit( event: React.FormEvent ) {
		event.preventDefault();

		if ( isLoading ) {
			return;
		}

		handleSendMessage();
	}

	return (
		<div
			className={ classnames( 'chatbox', {
				'chatbox-show': isVisible,
				'chatbox-hide': ! isVisible,
				'using-environment-badge': environmentBadge,
			} ) }
		>
			<WapuuRibbon
				onToggleVisibility={ handleToggleVisibility }
				isNudging={ isNudging }
				isLoading={ isLoading }
			/>
			<div className="chatbox-header">Wapuu Assistant</div>
			<div className="chat-box-message-container">
				<div className="chatbox-messages">
					{ chat.messages.map( ( message, index ) => (
						<div
							ref={ index === chat.messages.length - 1 ? messagesEndRef : null }
							className={ `chatbox-message ${ message.role === 'user' ? 'user' : 'wapuu' }` }
							key={ index }
						>
							{ message.content }
						</div>
					) ) }
				</div>
				<form onSubmit={ handleFormSubmit }>
					<div className="chatbox-input-area">
						<TextControl
							className="chatbox-input"
							type="text"
							value={ input }
							onChange={ handleMessageChange }
							onKeyDown={ handleKeyDown }
						/>
						<Button
							disabled={ isLoading }
							onClick={ handleSendMessage }
							className="chatbox-send-btn"
							type="button"
						>
							Send
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default OdysseusAssistant;
