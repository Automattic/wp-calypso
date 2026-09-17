import { useCallback, useEffect, useRef } from 'react';
import type { Message } from '../types';
import type { RefObject } from 'react';

interface UseAutoScrollOptions {
	scrollAreaRef: RefObject< HTMLDivElement | null >;
	visibleMessages: Message[];
}

const EASE_FACTOR = 0.12;
const SNAP_THRESHOLD = 1;

/**
 * Handles auto-scrolling behavior for the messages container.
 *
 * When the agent streams a response, scrolls until the last user message
 * reaches the top of the container, then stops. The scroll animation runs in
 * a requestAnimationFrame loop, fully decoupled from React's render cycle,
 * which prevents the "tug-of-war" that occurs when scrollTo is called on
 * every streaming update while the user is trying to scroll manually.
 *
 * Auto-scrolling is disabled when the user scrolls manually and re-enabled
 * when a new user message is sent.
 * @param root0
 * @param root0.scrollAreaRef
 * @param root0.visibleMessages
 */
export function useAutoScroll( { scrollAreaRef, visibleMessages }: UseAutoScrollOptions ) {
	const prevMessageCountRef = useRef( 0 );
	const isFirstRenderRef = useRef( true );
	const autoScrollEnabledRef = useRef( true );
	const rafIdRef = useRef( 0 );
	const expectedScrollTopRef = useRef< number | null >( null );

	const stopAnimation = useCallback( () => {
		cancelAnimationFrame( rafIdRef.current );
		rafIdRef.current = 0;
		expectedScrollTopRef.current = null;
	}, [] );

	// Runs a rAF loop that eases scrollTop toward the last user message.
	// Stops when the target is reached, auto-scroll is disabled, or the
	// container is gone.
	//
	// The loop also tracks where it left scrollTop on the previous frame.
	// If scrollTop has moved backward (i.e. the user scrolled up), it
	// stops immediately — no reliance on wheel/touchmove event timing.
	const startScrollToUserMessage = useCallback( () => {
		stopAnimation();

		const animate = () => {
			const container = scrollAreaRef.current;
			if ( ! container || ! autoScrollEnabledRef.current ) {
				stopAnimation();
				return;
			}

			// If scrollTop moved backward from where we set it, the user
			// scrolled up — bail out and hand control back to them.
			if (
				expectedScrollTopRef.current !== null &&
				container.scrollTop < expectedScrollTopRef.current - 1
			) {
				autoScrollEnabledRef.current = false;
				stopAnimation();
				return;
			}

			const target = getLastUserMessageTop( container );
			if ( target === null || container.scrollTop >= target ) {
				stopAnimation();
				return;
			}

			const distance = target - container.scrollTop;
			if ( distance <= SNAP_THRESHOLD ) {
				container.scrollTop = target;
				stopAnimation();
				return;
			}

			container.scrollTop += Math.ceil( distance * EASE_FACTOR );
			expectedScrollTopRef.current = container.scrollTop;
			rafIdRef.current = requestAnimationFrame( animate );
		};

		rafIdRef.current = requestAnimationFrame( animate );
	}, [ scrollAreaRef, stopAnimation ] );

	// Disable auto-scroll on user-initiated scroll gestures.
	// Using wheel/touchmove instead of the scroll event avoids reacting
	// to programmatic scrollTop assignments.
	useEffect( () => {
		const container = scrollAreaRef.current;
		if ( ! container ) {
			return;
		}

		const disableAutoScroll = () => {
			autoScrollEnabledRef.current = false;
			stopAnimation();
		};

		container.addEventListener( 'wheel', disableAutoScroll, {
			passive: true,
		} );
		container.addEventListener( 'touchmove', disableAutoScroll, {
			passive: true,
		} );

		return () => {
			container.removeEventListener( 'wheel', disableAutoScroll );
			container.removeEventListener( 'touchmove', disableAutoScroll );
		};
	}, [ scrollAreaRef, stopAnimation ] );

	// Clean up the rAF loop on unmount.
	useEffect( () => stopAnimation, [ stopAnimation ] );

	useEffect( () => {
		const container = scrollAreaRef.current;

		if ( ! container || visibleMessages.length === 0 ) {
			prevMessageCountRef.current = visibleMessages.length;
			return;
		}

		const hasNewMessage = visibleMessages.length > prevMessageCountRef.current;
		const lastMessage = visibleMessages[ visibleMessages.length - 1 ];

		// First render: instant scroll to bottom without animation.
		if ( isFirstRenderRef.current ) {
			container.scrollTop = container.scrollHeight;
			isFirstRenderRef.current = false;
			prevMessageCountRef.current = visibleMessages.length;
			return;
		}

		// Re-enable auto-scroll when the user sends a new message.
		if ( hasNewMessage && lastMessage.role === 'user' ) {
			autoScrollEnabledRef.current = true;
			stopAnimation();
		}

		if ( ! autoScrollEnabledRef.current ) {
			prevMessageCountRef.current = visibleMessages.length;
			return;
		}

		if ( lastMessage.role === 'agent' ) {
			// Kick off the rAF loop that eases the scroll position toward the
			// last user message. The loop self-terminates once the target is
			// reached. Re-starting on every streaming update is safe — it
			// no-ops if already running.
			if ( ! rafIdRef.current ) {
				startScrollToUserMessage();
			}
		} else if ( hasNewMessage ) {
			// Default behavior (top mode, or new user message in bottom mode):
			// always scroll to the very bottom.
			container.scrollTo( {
				top: container.scrollHeight,
				behavior: 'smooth',
			} );
		}

		prevMessageCountRef.current = visibleMessages.length;
	}, [ visibleMessages, scrollAreaRef, startScrollToUserMessage, stopAnimation ] );
}

function getLastUserMessageTop( container: HTMLElement ): number | null {
	const userMessages = container.querySelectorAll< HTMLElement >( '[data-role="user"]' );
	const lastUserMsg = userMessages[ userMessages.length - 1 ];
	return lastUserMsg?.offsetTop ?? null;
}
