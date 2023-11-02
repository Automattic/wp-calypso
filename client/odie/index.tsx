import { useCallback, useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { noop, useOdieAssistantContext } from './context';
import ChatMessage from './message';
import { OdieSendMessageButton } from './send-message-input';
import { useScrollStop } from './useScrollStop';

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
		scrollToBottom();
	}, [ scrollToBottom ] );

	const handleScroll = useCallback( () => {
		if ( ! chatboxMessagesRef.current ) {
			return;
		}

		const isAtBottom =
			chatboxMessagesRef.current.scrollTop + chatboxMessagesRef.current.clientHeight ===
			chatboxMessagesRef.current.scrollHeight;

		if ( isAtBottom ) {
			setStickToBottom( true );
		}
	}, [] );

	useScrollStop( chatboxMessagesRef.current, () => setStickToBottom( false ) );

	return (
		<div className="chatbox">
			<TrackComponentView
				eventName="calypso_odie_chatbox_view"
				eventProperties={ { bot_name_slug: botNameSlug } }
			/>
			<div className="chat-box-message-container">
				<div className="chatbox-messages" ref={ chatboxMessagesRef } onScroll={ handleScroll }>
					{ chat.messages.map( ( message, index ) => {
						const isLast = index === chat.messages.length - 1;
						return (
							<ChatMessage
								message={ message }
								key={ index }
								scrollToBottom={ isLast ? () => scrollToBottom( false, false ) : noop }
							/>
						);
					} ) }
					<div className="odie-chatbox-bottom-edge" ref={ bottomRef }></div>
				</div>
				<OdieSendMessageButton
					scrollToBottom={ scrollToBottom }
					enableStickToBottom={ () => setStickToBottom( true ) }
					bottomElement={ bottomElement?.target }
					isBottomVisible={ inView }
				/>
			</div>
		</div>
	);
};

export default OdieAssistant;
