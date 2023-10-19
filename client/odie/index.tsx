import classnames from 'classnames';
import { useRef, useEffect } from 'react';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { useOdieAssistantContext } from './context';
import ChatMessage from './message';
import { JumpToRecent } from './message/jump-to-recent';
import { OdieSendMessageButton } from './send-message-input';
import WapuuRibbon from './wapuu-ribbon';

import './style.scss';

export const WAPUU_ERROR_MESSAGE =
	"Wapuu oopsie! 😺 My bad, but even cool pets goof. Let's laugh it off! 🎉, ask me again as I forgot what you said!";

type OdieAssistantProps = {
	botNameSlug: string;
	isSimpleChatbox?: boolean;
	isFloatingChatbox?: boolean;
	isHeaderVisible?: boolean;
};

const OdieAssistant = ( props: OdieAssistantProps ) => {
	const { isSimpleChatbox, botNameSlug, isFloatingChatbox = true, isHeaderVisible = true } = props;
	const {
		botName,
		botSetting,
		lastNudge,
		chat,
		setMessages,
		isLoading,
		isNudging,
		setIsNudging,
		isVisible,
		setIsVisible,
	} = useOdieAssistantContext();

	const dispatch = useDispatch();

	const environmentBadge = document.querySelector( 'body > .environment-badge' );

	const messagesEndRef = useRef< HTMLDivElement | null >( null );
	const inputRef = useRef< HTMLDivElement | null >( null );
	const bottomRef = useRef< HTMLDivElement | null >( null );

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

	const handleToggleVisibility = () => {
		const newVisibility = ! isVisible;

		dispatch(
			recordTracksEvent( 'calypso_odie_chat_toggle_visibility_click', {
				visible: newVisibility,
				bot_name_slug: botNameSlug,
				simple_chatbox: isSimpleChatbox,
			} )
		);

		setIsVisible( newVisibility );
	};

	return (
		<div
			className={ classnames( 'chatbox', {
				'chatbox-floating': isFloatingChatbox,
				'chatbox-show': isVisible && ! isSimpleChatbox && isFloatingChatbox,
				'chatbox-hide': ! isVisible && ! isSimpleChatbox && isFloatingChatbox,
				'chatbox-show-vertical': isVisible && isSimpleChatbox && isFloatingChatbox,
				'chatbox-hide-vertical': ! isVisible && isSimpleChatbox && isFloatingChatbox,
				'using-environment-badge': environmentBadge && isFloatingChatbox,
				'chatbox-big': botSetting === 'supportDocs' && isFloatingChatbox,
			} ) }
		>
			<TrackComponentView
				eventName="calypso_odie_chatbox_view"
				eventProperties={ { bot_name_slug: botNameSlug } }
			/>
			{ ! isSimpleChatbox && isHeaderVisible && (
				<WapuuRibbon
					onToggleVisibility={ handleToggleVisibility }
					isNudging={ isNudging }
					isLoading={ isLoading }
				/>
			) }
			{ isHeaderVisible && (
				<div className="chatbox-header">
					<span>{ botName }</span>
				</div>
			) }
			<div
				className={ classnames( 'chat-box-message-container', {
					'has-top-border': ! isFloatingChatbox,
				} ) }
			>
				<div className="chatbox-messages">
					{ chat.messages.map( ( message, index ) => (
						<ChatMessage
							message={ message }
							isLast={ index === chat.messages.length - 1 }
							messageEndRef={ messagesEndRef }
							key={ index }
						/>
					) ) }
					<div className="odie-chatbox-bottom-edge" ref={ bottomRef }></div>
					<JumpToRecent lastMessageRef={ bottomRef } inputRef={ inputRef } />
				</div>
				<div className="odie-chat-message-input-container" ref={ inputRef }>
					<OdieSendMessageButton />
				</div>
			</div>
		</div>
	);
};

export default OdieAssistant;
