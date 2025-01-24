import { RefObject, useEffect, useRef } from 'react';
import { useOdieAssistantContext } from '../context';

export const useAutoScroll = ( messagesContainerRef: RefObject< HTMLDivElement > ) => {
	const { chat, experimentVariationName } = useOdieAssistantContext();
	const debounceTimeoutRef = useRef< number >( 500 );
	const debounceTimeoutIdRef = useRef< number | null >( null );
	const lastChatStatus = useRef< string | null >( null );
	useEffect( () => {
		const messageCount = chat.messages.length;
		if ( messageCount < 1 || chat.status === 'loading' ) {
			return;
		}

		if ( experimentVariationName === 'give_wapuu_a_chance' && chat.status === 'dislike' ) {
			return;
		}

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
				const messages = messagesContainerRef.current?.querySelectorAll(
					'[data-is-message="true"],.odie-chatbox__action-message'
				);
				let lastMessage = messages?.length ? messages[ messages.length - 1 ] : null;

				if ( hasOdieReplied ) {
					// After odie reply we scroll the user message since bot replies can be long
					lastMessage = messages?.length ? messages[ messages.length - 2 ] : null;
				}

				lastMessage?.scrollIntoView( { behavior: 'smooth', block: 'start', inline: 'nearest' } );
			} );
		}, debounceTimeoutRef.current ) as unknown as number;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ chat.messages.length, chat.status, messagesContainerRef.current ] );
};
