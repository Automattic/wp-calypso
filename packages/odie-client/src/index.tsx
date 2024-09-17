import { Spinner } from '@wordpress/components';
import { useEffect, useRef, useState } from 'react';
import { MessagesContainer } from './components/message/messages-container';
import { OdieSendMessageButton } from './components/send-message-input';
import { useOdieAssistantContext, OdieAssistantProvider } from './context';
import useAutoScroll from './useAutoScroll';
import useLastMessageVisibility from './useLastMessageVisibility';

import './style.scss';

export const ODIE_THUMBS_DOWN_RATING_VALUE = 0;
export const ODIE_THUMBS_UP_RATING_VALUE = 1;

export const OdieAssistant: React.FC = () => {
	const { chat, trackEvent, currentUser, isLoadingEnvironment, isLoadingExistingChat } =
		useOdieAssistantContext();
	const [ asisstantLoaded, setAssistantLoaded ] = useState( false );
	const containerRef = useRef< HTMLDivElement >( null );
	const messagesContainerRef = useRef< HTMLDivElement >( null );

	useEffect( () => {
		trackEvent( 'chatbox_view' );
	}, [ trackEvent ] );

	useAutoScroll( messagesContainerRef, chat.messages );
	useLastMessageVisibility( messagesContainerRef, chat.messages.length );

	useEffect( () => {
		if ( chat.messages.length > 0 ) {
			setAssistantLoaded( true );
		}
	}, [ chat.messages.length ] );

	if (
		( isLoadingEnvironment || isLoadingExistingChat ) &&
		chat.messages.length === 0 &&
		! asisstantLoaded
	) {
		return (
			<div
				className="chatbox"
				style={ {
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					height: '100%',
				} }
			>
				<Spinner />
			</div>
		);
	}

	return (
		<div className="chatbox">
			<div className="chat-box-message-container" ref={ containerRef }>
				<MessagesContainer currentUser={ currentUser } ref={ messagesContainerRef } />
			</div>
			<OdieSendMessageButton containerReference={ messagesContainerRef } />
		</div>
	);
};

export default OdieAssistantProvider;
export { useOdieAssistantContext } from './context';
export { useSetOdieStorage, useGetOdieStorage } from './data';
export { EllipsisMenu } from './components/ellipsis-menu';
export { isOdieAllowedBot } from './utils/is-odie-allowed-bot';
