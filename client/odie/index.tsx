import { TextControl, Button } from '@wordpress/components';
import classnames from 'classnames';
import { useRef, useEffect, useState } from 'react';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { useOdieAssistantContext } from './context';
import ChatMessage from './message';
import { useOdieGetChatPollQuery, useOdieSendMessage } from './query';
import WapuuRibbon from './wapuu-ribbon';

import './style.scss';

export const WAPUU_ERROR_MESSAGE =
	"Wapuu oopsie! 😺 My bad, but even cool pets goof. Let's laugh it off! 🎉, ask me again as I forgot what you said!";

type OdieAssistantProps = {
	botNameSlug: string;
	simple?: boolean;
};

const OdieAssistant = ( props: OdieAssistantProps ) => {
	const { simple, botNameSlug } = props;
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
	} = useOdieAssistantContext();
	const [ input, setInput ] = useState( '' );
	const { mutateAsync: sendOdieMessage } = useOdieSendMessage();
	const { data: chatData } = useOdieGetChatPollQuery( chat.chat_id ?? null );
	const [ userInteracted, setUserInteracted ] = useState( false );

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

			addMessage( {
				content: '...',
				role: 'bot',
				type: 'placeholder',
			} );

			const response = await sendOdieMessage( {
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
		setUserInteracted( true );

		dispatch(
			recordTracksEvent( 'calypso_odie_chat_toggle_visibility_click', {
				visible: newVisibility,
				bot_name_slug: botNameSlug,
				simple_chatbox: simple,
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
				'chatbox-show': isVisible && ! simple,
				'chatbox-hide': ! isVisible && ! simple,
				'chatbox-show-vertical': isVisible && simple,
				'chatbox-hide-vertical': ! isVisible && simple,
				'using-environment-badge': environmentBadge,
			} ) }
		>
			<TrackComponentView
				eventName="calypso_odie_chatbox_view"
				eventProperties={ { bot_name_slug: botNameSlug } }
			/>
			{ ! simple && (
				<WapuuRibbon
					onToggleVisibility={ handleToggleVisibility }
					isNudging={ isNudging }
					isLoading={ isLoading }
				/>
			) }
			<div className="chatbox-header">
				{ ! simple ? (
					'Wapuu Assistant'
				) : (
					<>
						<button className="chatbox-header-button" onClick={ handleToggleVisibility }>
							<span
								className={ classnames( {
									'chatbox-attention': ! userInteracted || isNudging,
								} ) }
							>
								Wapuu Assistant
							</span>
						</button>
					</>
				) }
			</div>

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

export default OdieAssistant;
