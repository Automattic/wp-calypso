import { useEffect, useRef } from 'react';
import { useOdieAssistantContext } from './context';

// This code uses a debounce to prevent the last message from being marked as visible too soon.
// Because when the last message is marked as visible, the DOM changes to show the "Jump to recent" button.
// And the scrolling stops before finishing the smooth scroll.
const useLastMessageVisibility = (
	messagesContainerRef: React.RefObject< HTMLDivElement >,
	messageCount: number
) => {
	const { setLastMessageInView } = useOdieAssistantContext();
	const debounceTimeoutIdRef = useRef< number | null >( null );

	useEffect( () => {
		if ( messageCount < 2 ) {
			return;
		}

		let lastMessageRef: HTMLDivElement | null = null;
		if ( messagesContainerRef.current ) {
			lastMessageRef = messagesContainerRef.current.querySelector(
				'[data-is-last-message="true"]'
			);
		}

		const observer = new IntersectionObserver( ( entries ) => {
			entries.forEach( ( entry ) => {
				if (
					entry.target.getAttribute( 'data-is-last-message' ) === 'true' &&
					setLastMessageInView
				) {
					if ( debounceTimeoutIdRef.current ) {
						clearTimeout( debounceTimeoutIdRef.current );
					}
					debounceTimeoutIdRef.current = setTimeout( () => {
						setLastMessageInView( entry.isIntersecting && messageCount > 2 );
					}, 500 );
				}
			} );
		} );

		if ( lastMessageRef ) {
			observer.observe( lastMessageRef );
		}

		return () => {
			if ( lastMessageRef ) {
				observer.disconnect();
			}
			if ( debounceTimeoutIdRef.current ) {
				clearTimeout( debounceTimeoutIdRef.current );
			}
		};
	}, [ setLastMessageInView, messagesContainerRef, messageCount ] );
};

export default useLastMessageVisibility;
