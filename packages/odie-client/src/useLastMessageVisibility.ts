import { useEffect } from 'react';
import { useOdieAssistantContext } from './context';

const useLastMessageVisibility = (
	messagesContainerRef: React.RefObject< HTMLDivElement >,
	messageCount: number
) => {
	const { setLastMessageInView } = useOdieAssistantContext();
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
					setLastMessageInView( entry.isIntersecting );
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
		};
	}, [ setLastMessageInView, messagesContainerRef, messageCount ] );
};

export default useLastMessageVisibility;
