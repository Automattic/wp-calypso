import { RefObject, useEffect, useRef, useState } from 'react';
import { useOdieAssistantContext } from '../context';

export const useAutoScroll = (
	messagesContainerRef: RefObject< HTMLDivElement | null >,
	isEnabled: boolean
): boolean => {
	const { chat } = useOdieAssistantContext();
	const debounceTimeoutRef = useRef< number >( 500 );
	const debounceTimeoutIdRef = useRef< number | null >( null );
	const lastChatStatus = useRef< string | null >( null );
	const followedStreamedReply = useRef( false );
	const [ isScrolling, setIsScrolling ] = useState( false );

	const lastMessage = chat.messages.at( -1 );
	const streamedText =
		chat.status === 'sending' && lastMessage?.role === 'bot' ? lastMessage.content : null;

	useEffect( () => {
		if ( chat.status === 'loading' || lastMessage?.role !== 'bot' ) {
			followedStreamedReply.current = false;
		}
	}, [ chat.status, lastMessage ] );

	useEffect( () => {
		if ( ! isEnabled || streamedText === null ) {
			return;
		}

		followedStreamedReply.current = true;
		requestAnimationFrame( () => {
			const messages = messagesContainerRef.current?.querySelectorAll( '.odie-chatbox-message' );
			messages?.[ messages.length - 1 ]?.scrollIntoView( {
				behavior: 'instant',
				block: 'end',
				inline: 'nearest',
			} );
		} );
	}, [ streamedText, isEnabled, messagesContainerRef ] );

	useEffect( () => {
		if ( ! isEnabled ) {
			return;
		}

		const messageCount = chat.messages.length;
		if ( messageCount < 1 || [ 'loading', 'sending' ].includes( chat.status ) ) {
			return;
		}

		// The reader followed the streamed reply down. Scrolling to its start, on completion or when the
		// chat reloads afterwards, would lose their place; the next message they send resets this.
		if ( followedStreamedReply.current ) {
			lastChatStatus.current = chat.status;
			return;
		}

		setIsScrolling( true );

		if ( debounceTimeoutIdRef.current ) {
			clearTimeout( debounceTimeoutIdRef.current );
		}

		const isLastMessageFromOdie =
			chat?.messages?.length > 0 && chat?.messages[ chat?.messages?.length - 1 ].role === 'bot';
		const hasOdieReplied =
			lastChatStatus.current === 'sending' && chat.status === 'loaded' && isLastMessageFromOdie;
		lastChatStatus.current = chat.status;

		debounceTimeoutIdRef.current = setTimeout( () => {
			debounceTimeoutRef.current = 0;
			requestAnimationFrame( () => {
				const messages = messagesContainerRef.current?.querySelectorAll( '.odie-chatbox-message' );
				let lastMessage = messages?.length ? messages[ messages.length - 1 ] : null;

				if ( hasOdieReplied ) {
					// After odie reply we scroll the user message since bot replies can be long
					lastMessage = messages?.length ? messages[ messages.length - 2 ] : null;
				}

				lastMessage?.scrollIntoView( { behavior: 'instant', block: 'start', inline: 'nearest' } );
				setIsScrolling( false );
			} );
		}, debounceTimeoutRef.current ) as unknown as number;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ chat.messages.length, chat.status, messagesContainerRef.current, isEnabled ] );

	return isScrolling;
};
