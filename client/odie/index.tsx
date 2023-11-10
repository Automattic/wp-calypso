import { WheelEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { useOdieAssistantContext } from './context';
import ChatMessage from './message';
import { OdieSendMessageButton } from './send-message-input';

import './style.scss';

export const WAPUU_ERROR_MESSAGE =
	"Wapuu oopsie! 😺 My bad, but even cool pets goof. Let's laugh it off! 🎉, ask me again as I forgot what you said!";

const OdieAssistant = () => {
	const { chat, botNameSlug } = useOdieAssistantContext();
	const chatboxMessagesRef = useRef< HTMLDivElement | null >( null );
	const { ref: bottomRef, entry: bottomElement, inView } = useInView( { threshold: 0 } );
	const [ stickToBottom, setStickToBottom ] = useState( true );

	const scrollToBottom = useCallback(
		( smooth = false, force = false ) => {
			if ( force || stickToBottom ) {
				requestAnimationFrame( () => {
					if ( bottomElement?.target ) {
						bottomElement.target.scrollIntoView( {
							behavior: smooth ? 'smooth' : 'auto',
							block: 'end',
						} );
					}
				} );
			}
		},
		[ bottomElement?.target, stickToBottom ]
	);

	useEffect( () => {
		scrollToBottom( false, true );
	}, [ scrollToBottom, chat.messages.length ] );

	return (
		<div className="chatbox">
			<TrackComponentView
				eventName="calypso_odie_chatbox_view"
				eventProperties={ { bot_name_slug: botNameSlug } }
			/>
			<div className="chat-box-message-container">
				<div
					className="chatbox-messages"
					ref={ chatboxMessagesRef }
					onWheel={ ( event: WheelEvent< HTMLDivElement > ) => {
						// If delta is negative, we are scrolling up so we want to disable stick to bottom
						// we might improve this in the future for touch devices
						if ( event.deltaY < 0 ) {
							setStickToBottom( false );
						} else if ( chatboxMessagesRef.current ) {
							const scrollHeight = chatboxMessagesRef.current.scrollHeight;
							const scrollTop = chatboxMessagesRef.current.scrollTop;
							const clientHeight = chatboxMessagesRef.current.clientHeight;
							const scrollBottom = scrollHeight - scrollTop - clientHeight;
							setStickToBottom( scrollBottom < 8 );
						}
					} }
				>
					{ chat.messages.map( ( message, index ) => {
						return (
							<ChatMessage message={ message } key={ index } scrollToBottom={ scrollToBottom } />
						);
					} ) }
					<div className="odie-chatbox-bottom-edge" ref={ bottomRef } />
				</div>
				<OdieSendMessageButton
					scrollToBottom={ scrollToBottom }
					enableStickToBottom={ () => setStickToBottom( true ) }
					enableJumpToRecent={ ! inView && ! stickToBottom }
				/>
			</div>
		</div>
	);
};

export default OdieAssistant;
