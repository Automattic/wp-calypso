import { useEffect, useRef } from '@wordpress/element';

/**
 * Persist the value in memory so when the element is unmounted it doesn't get lost.
 */
const cachedScrollPositions: Record< string, number > = {};

export const useHelpCenterChatScroll = (
	id: number | string | null,
	scrollParentRef: React.RefObject< HTMLElement >,
	isEnabled: boolean
) => {
	const timeoutRef = useRef< ReturnType< typeof setTimeout > | null >( null );

	useEffect( () => {
		if ( ! id || ! scrollParentRef?.current ) {
			return;
		}

		const scrollRef = scrollParentRef?.current;
		const scrollBehaviour = scrollRef.style.scrollBehavior;

		// temporary disable smooth scrolling
		scrollRef.style.scrollBehavior = 'auto';

		if ( isEnabled ) {
			if ( cachedScrollPositions[ id ] ) {
				setTimeout( () => {
					scrollRef.scrollTop = cachedScrollPositions[ id ];
				}, 1000 );
			} else {
				scrollRef.scrollTop = 0;
			}
		}

		// restore smooth scrolling
		scrollRef.style.scrollBehavior = scrollBehaviour;

		const handleScroll = ( event: { target: EventTarget | null } ) => {
			if ( timeoutRef.current ) {
				clearTimeout( timeoutRef.current );
			}

			timeoutRef.current = setTimeout( () => {
				if ( event.target === scrollParentRef.current ) {
					cachedScrollPositions[ id ] = Number( scrollRef.scrollTop );
				}
			}, 250 );
		};

		scrollRef.addEventListener( 'scroll', handleScroll );
		return () => {
			if ( timeoutRef.current ) {
				clearTimeout( timeoutRef.current ); // Clear the timeout during cleanup
			}
			scrollRef?.removeEventListener( 'scroll', handleScroll );
		};
	}, [ id, isEnabled, scrollParentRef ] );
};
