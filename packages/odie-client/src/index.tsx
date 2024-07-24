import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { MessagesContainer } from './components/message/messages-container';
import { OdieSendMessageButton } from './components/send-message-input';
import { useOdieAssistantContext, OdieAssistantProvider } from './context';

import './style.scss';

export const ODIE_THUMBS_DOWN_RATING_VALUE = 0;
export const ODIE_THUMBS_UP_RATING_VALUE = 1;

export const OdieAssistant: React.FC = () => {
	const { chat, trackEvent, currentUser } = useOdieAssistantContext();
	const containerRef = useRef< HTMLDivElement >( null );
	const {
		ref: bottomRef,
		entry: lastMessageEntry,
		inView,
	} = useInView( {
		threshold: 0,
		delay: 1000,
	} );

	const target = useMemo( () => lastMessageEntry?.target, [ lastMessageEntry ] );
	const lastMessage = useMemo( () => chat.messages[ chat.messages.length - 1 ], [ chat.messages ] );

	useEffect( () => {
		trackEvent( 'chatbox_view' );
	}, [ trackEvent ] );

	const scrollToBottom = useCallback( () => {
		if ( target && lastMessage ) {
			target.scrollIntoView( { behavior: 'smooth', block: 'start', inline: 'nearest' } );
		}
	}, [ target, lastMessage ] );

	useEffect( () => {
		if ( target && lastMessage ) {
			scrollToBottom();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ lastMessage, target ] );

	return (
		<div className="chatbox" ref={ containerRef }>
			<div className="chat-box-message-container">
				<div className="chatbox-messages">
					<MessagesContainer ref={ bottomRef } chat={ chat } currentUser={ currentUser } />
				</div>
				<OdieSendMessageButton scrollToRecent={ scrollToBottom } enableJumpToRecent={ ! inView } />
			</div>
		</div>
	);
};

export default OdieAssistantProvider;
export { useOdieAssistantContext } from './context';
export { useSetOdieStorage, useGetOdieStorage } from './data';
export { EllipsisMenu } from './components/ellipsis-menu';
