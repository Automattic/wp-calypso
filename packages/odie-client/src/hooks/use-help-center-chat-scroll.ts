import { HelpCenterSelect } from '@automattic/data-stores';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useSelect, useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';

/**
 * Persist the value in memory so when the element is unmounted it doesn't get lost.
 */
const cachedScrollPositions: Record< string, number > = {};

const setScroll = ( scrollRef: HTMLElement, scrollFunc: () => void ) => {
	if ( scrollRef ) {
		const scrollBehaviour = scrollRef.style.scrollBehavior;
		// temporary disable smooth scrolling
		scrollRef.style.scrollBehavior = 'auto';

		scrollFunc?.();

		// restore smooth scrolling
		scrollRef.style.scrollBehavior = scrollBehaviour;
	}
};

export const useHelpCenterChatScroll = (
	id: number | string | null,
	scrollParentRef: React.RefObject< HTMLElement >,
	// scrollPositionY: number,
	isEnabled: boolean
) => {
	const timeoutRef = useRef< ReturnType< typeof setTimeout > | null >( null );
	const { chatRelatedGuidesScrollY } = useSelect( ( select ) => {
		const store = select( HELP_CENTER_STORE ) as HelpCenterSelect;
		return {
			chatRelatedGuidesScrollY: store.getChatRelatedGuidesScrollY(),
		};
	}, [] );

	const { setChatRelatedGuidesScrollY } = useDataStoreDispatch( HELP_CENTER_STORE );

	useEffect( () => {
		if ( ! id || ! scrollParentRef?.current ) {
			return;
		}

		const scrollRef = scrollParentRef?.current;
		// const scrollBehaviour = scrollRef.style.scrollBehavior;
		// const scrollPosiiton = scrollPositionY || cachedScrollPositions[ id ] || 0;

		if ( chatRelatedGuidesScrollY && isEnabled ) {
			setScroll( scrollRef, () =>
				setTimeout( () => {
					scrollRef.scrollTop = chatRelatedGuidesScrollY;
					// setChatRelatedGuidesScrollY( 0 );
				}, 1000 )
			);

			return;
		}

		// // temporary disable smooth scrolling
		// scrollRef.style.scrollBehavior = 'auto';

		// if ( isEnabled && cachedScrollPositions[ id ] ) {
		// 	scrollRef.scrollTop = scrollPosiiton;
		// } else {
		// 	scrollRef.scrollTop = 0;
		// }

		// // restore smooth scrolling
		// scrollRef.style.scrollBehavior = scrollBehaviour;

		if ( isEnabled && cachedScrollPositions[ id ] ) {
			setScroll( scrollRef, () => ( scrollRef.scrollTop = cachedScrollPositions[ id ] ) );
		}

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
	}, [ chatRelatedGuidesScrollY, id, isEnabled, scrollParentRef, setChatRelatedGuidesScrollY ] );
};
