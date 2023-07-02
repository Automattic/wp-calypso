import { TextControl, Button } from '@wordpress/components';
import { useRef, useEffect, useState } from 'react';
import { useSelector } from 'calypso/state';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { useOdysseusAssistantContext } from './context';
import { useOddyseusEndpointPost } from './query';
import WapuuRibbon from './wapuu-ribbon';
import type { Message } from './query';

import './style.scss';

const OdysseusAssistant = () => {
	const siteId = useSelector( getSelectedSiteId );
	const { lastNudge, sectionName } = useOdysseusAssistantContext();
	const [ input, setInput ] = useState( '' );
	const [ isVisible, setIsVisible ] = useState( false );
	const [ isLoading, setIsLoading ] = useState( false );
	const [ isNudging, setIsNudging ] = useState( false );
	const { mutateAsync } = useOddyseusEndpointPost( siteId );
	const [ messages, setMessages ] = useState< Message[] >( [
		{ text: 'Hello, I am Wapuu! Your personal assistant.', sender: 'wapuu' },
	] );

	// Clear messages when switching sections
	useEffect( () => {
		setMessages( [] );
	}, [ sectionName ] );

	const addMessage = ( message: string, sender: 'user' | 'wapuu' ) => {
		setMessages( ( prevMessages ) => [ ...prevMessages, { text: message, sender } ] );
	};

	const messagesEndRef = useRef< HTMLDivElement | null >( null );

	useEffect( () => {
		messagesEndRef.current?.scrollIntoView( { behavior: 'smooth' } );
	}, [ messages ] );
	useEffect( () => {
		if ( lastNudge ) {
			setMessages( [
				{
					text: lastNudge.initialMessage,
					sender: 'wapuu',
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

		setMessages( [ { text: 'Hello, I am Wapuu! Your personal assistant.', sender: 'wapuu' } ] );
	}, [ lastNudge ] );

	const handleMessageChange = ( text: string ) => {
		setInput( text );
	};

	const handleSendMessage = async () => {
		try {
			setIsLoading( true );
			addMessage( input, 'user' );
			setInput( '' );
			const response = await mutateAsync( {
				prompt: input,
				context: lastNudge ?? {
					nudge: 'none',
					context: {},
					initialMessage: 'Hello, I am Wapuu, your personal WordPress assistant',
				},
				messages,
			} );

			addMessage( response, 'wapuu' );
		} catch ( _ ) {
			addMessage(
				"Wapuu oopsie! 😺 My bad, but even cool pets goof. Let's laugh it off! 🎉, ask me again as I forgot what you said!",
				'wapuu'
			);
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
		handleSendMessage();
	}

	return (
		<div className={ `chatbox ${ isVisible ? 'chatbox-show' : 'chatbox-hide' }` }>
			<WapuuRibbon
				onToggleVisibility={ handleToggleVisibility }
				isNudging={ isNudging }
				isLoading={ isLoading }
			/>
			<div className="chatbox-header">Wapuu</div> { /* This is the new header */ }
			<div className="chat-box-message-container">
				<div className="chatbox-messages">
					{ messages.map( ( message, index ) => (
						<div
							className={ `chatbox-message ${ message.sender === 'user' ? 'user' : 'wapuu' }` }
							key={ index }
						>
							{ message.text }
						</div>
					) ) }
					<div ref={ messagesEndRef } />
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
						<Button onClick={ handleSendMessage } className="chatbox-send-btn" type="button">
							Send
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default OdysseusAssistant;
