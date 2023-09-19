import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import { useRef, useEffect, useState } from 'react';
import BackButton from 'calypso/components/back-button';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import FormTextInputWithAction from '../components/forms/form-text-input-with-action';
import { useOdieAssistantContext } from './context';
import ChatMessage from './message';
import { useOdieGetChatPollQuery, useOdieSendMessage } from './query';
import WapuuRibbon from './wapuu-ribbon';

import './style.scss';

export const WAPUU_ERROR_MESSAGE =
	"Wapuu oopsie! 😺 My bad, but even cool pets goof. Let's laugh it off! 🎉, ask me again as I forgot what you said!";

type OdieAssistantProps = {
	helpCenter?: React.ReactNode;
	botNameSlug: string;
	simple?: boolean;
};

const OdieAssistant = ( props: OdieAssistantProps ) => {
	const { helpCenter = null, simple, botNameSlug } = props;
	const {
		addMessage,
		botName,
		botSetting,
		lastNudge,
		chat,
		setMessages,
		isLoading,
		setIsLoading,
		isNudging,
		setIsNudging,
		isVisible,
		setIsVisible,
		isHelpCenterVisible,
		onSearchDoc: onBackButton,
	} = useOdieAssistantContext();
	const hasHelpCenter = helpCenter !== null;
	const [ input, setInput ] = useState( '' );
	const { mutateAsync: sendOdieMessage } = useOdieSendMessage();
	const { data: chatData } = useOdieGetChatPollQuery( chat.chat_id ?? null );
	const translate = useTranslate();

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

		dispatch(
			recordTracksEvent( 'calypso_odie_chat_toggle_visibility_click', {
				visible: newVisibility,
				bot_name_slug: botNameSlug,
				simple_chatbox: simple,
			} )
		);

		setIsVisible( newVisibility );
	};

	return (
		<div
			className={ classnames( 'chatbox', {
				'chatbox-show': isVisible && ! simple,
				'chatbox-hide': ! isVisible && ! simple,
				'chatbox-show-vertical': isVisible && simple,
				'chatbox-hide-vertical': ! isVisible && simple,
				'using-environment-badge': environmentBadge,
				'chatbox-big': botSetting === 'supportDocs',
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
			<div
				className={ classnames( 'chatbox-header', {
					'chatbox-header-with-help': hasHelpCenter,
				} ) }
			>
				{ ! isHelpCenterVisible && <BackButton onClick={ onBackButton } /> }
				<span>{ botName }</span>
			</div>

			{ hasHelpCenter && isHelpCenterVisible && (
				<div className="chatbox-help-center-container">{ helpCenter }</div>
			) }
			{ ! hasHelpCenter ||
				( hasHelpCenter && ! isHelpCenterVisible && (
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
						<div className="chatbox-input-area">
							<FormTextInputWithAction
								className="reader-sidebar-tags__text-input"
								placeholder={ translate( 'Enter message', {
									context:
										'Placeholder text for the input field where the user can type a message to a chat bot',
								} ) }
								action={ translate( 'Send', {
									context: 'Button label for sending a message to a chat bot',
								} ) }
								onAction={ handleSendMessage }
								onChange={ handleMessageChange }
								clearOnSubmit
							/>
						</div>
					</div>
				) ) }
		</div>
	);
};

export default OdieAssistant;
