import { RefObject, useEffect, useRef } from 'react';
import { useOdieAssistantContext } from './context';

const useAutoScroll = ( messagesContainerRef: RefObject< HTMLDivElement > ) => {
	const { chatStatus, chat } = useOdieAssistantContext();
	const debounceTimeoutRef = useRef< number >( 500 );
	const debounceTimeoutIdRef = useRef< number | null >( null );

	useEffect( () => {
		const messageCount = chat.messages.length;
		if ( messageCount < 2 || chatStatus === 'loading' ) {
			return;
		}

		if ( debounceTimeoutIdRef.current ) {
			clearTimeout( debounceTimeoutIdRef.current );
		}

		debounceTimeoutIdRef.current = setTimeout( () => {
			debounceTimeoutRef.current = 0;
			requestAnimationFrame( () => {
				const messages = messagesContainerRef.current?.querySelectorAll(
					'[data-is-message="true"]'
				);
				const lastMessage = messages?.length ? messages[ messages.length - 1 ] : null;
				lastMessage?.scrollIntoView( { behavior: 'smooth', block: 'start', inline: 'nearest' } );
			} );
		}, debounceTimeoutRef.current ) as unknown as number;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ chat.messages.length, chatStatus, messagesContainerRef.current ] );
};

export default useAutoScroll;
