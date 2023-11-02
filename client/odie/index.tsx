import { useCallback, useEffect, useRef, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { noop, useOdieAssistantContext } from './context';
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
	const lastScrollHeight = useRef( 0 );

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

		const { scrollTop, scrollHeight, clientHeight } = chatboxMessagesRef.current;
		const isUserScroll = lastScrollHeight.current === scrollHeight;

		// If the scrollHeight didn't change, then it's a user scroll
		if ( isUserScroll ) {
			// User scrolls up: stickToBottom is set to false
			if ( scrollTop < scrollHeight - clientHeight ) {
				setStickToBottom( false );
			}
			// User scrolls down (near the end, within 10 pixels of the bottom): stickToBottom is set to true
			else if ( scrollTop >= scrollHeight - clientHeight - 10 ) {
				setStickToBottom( true );
			}
		}

		// Update the last scroll height for the next scroll event
		lastScrollHeight.current = scrollHeight;
	}, [] );

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
								scrollToBottom={ isLast ? () => scrollToBottom( false, true ) : noop }
							/>
						);
					} ) }
					<div className="odie-chatbox-bottom-edge" ref={ bottomRef }></div>
				</div>
				<OdieSendMessageButton
					scrollToBottom={ scrollToBottom }
					enableStickToBottom={ () => {} }
					bottomElement={ bottomElement?.target }
					isBottomVisible={ inView }
				/>
			</div>
		</div>
	);
};

export default OdieAssistant;
