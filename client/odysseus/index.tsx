import { TextControl, Button } from '@wordpress/components';
import classnames from 'classnames';
import { useRef, useEffect, useState } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { useOdysseusAssistantContext } from './context';
import ChatMessage from './message';
import { useOdysseusGetChatPollQuery, useOddyseusSendMessage } from './query';
import WapuuRibbon from './wapuu-ribbon';

import './style.scss';

export const WAPUU_ERROR_MESSAGE =
	"Wapuu oopsie! 😺 My bad, but even cool pets goof. Let's laugh it off! 🎉, ask me again as I forgot what you said!";

const OdysseusAssistant = () => {
	const {
		lastNudge,
		chat,
		addMessage,
		setMessages,
		isLoading,
		setIsLoading,
		isNudging,
		setIsNudging,
		isVisible,
		setIsVisible,
	} = useOdysseusAssistantContext();
	const [ input, setInput ] = useState( '' );
	const { mutateAsync: sendOdysseusMessage } = useOddyseusSendMessage();
	const { data: chatData } = useOdysseusGetChatPollQuery( chat.chat_id ?? null );

	const dispatch = useDispatch();

	useEffect( () => {
		if ( chatData ) {
			if ( chat.messages.length < chatData.messages.length ) {
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
	}, [ lastNudge, setIsNudging, setMessages ] );

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
				content: WAPUU_ERROR_MESSAGE,
				role: 'bot',
				type: 'error',
			} );
		} finally {
			setIsLoading( false );
		}
	};

	const handleToggleVisibility = () => {
		const newVisibility = ! isVisible;

		dispatch(
			recordTracksEvent( 'calypso_odysseus_chat_toggle_visibility_click', {
				visible: newVisibility,
				bot_name_slug: 'wapuu',
			} )
		);

		setIsVisible( newVisibility );
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
						<ChatMessage
							message={ message }
							isLast={ index === chat.messages.length - 1 }
							messageEndRef={ messagesEndRef }
							key={ index }
						/>
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
