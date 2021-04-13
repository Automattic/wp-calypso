/**
 * External dependencies
 */
import React, { useCallback, useEffect, useRef } from 'react';
import { createHigherOrderComponent } from '@wordpress/compose';

/**
 * Hook that will scroll to the bottom of a scrollable container whenever it's rendered.
 * When the scrollable element is scrolled manually by the user autoscroll is disabled until the
 * user scrolls back to the bottom of the content.
 *
 * To use the hook you need to call it then call the returned `setTarget( node )` callback in
 * your component where `node` is an html element with scrolling enabled. It will be a ref callback
 * in most usages.
 *
 * After every update the content will be scrolled to the bottom of the content.
 *
 */
export function useAutoscroll() {
	const autoscrollEnabled = useRef( true );
	const autoscrollNode = useRef( null );

	const scrollToBottom = useCallback( () => {
		if ( autoscrollEnabled.current && autoscrollNode.current ) {
			const { scrollHeight, offsetHeight } = autoscrollNode.current;
			autoscrollNode.current.scrollTop = Math.max( 0, scrollHeight - offsetHeight );
		}
	}, [] );

	useEffect( () => {
		window.addEventListener( 'resize', scrollToBottom );

		return () => {
			window.removeEventListener( 'resize', scrollToBottom );
		};
	}, [ scrollToBottom ] );

	useEffect( () => {
		scrollToBottom();
	} );

	const detectScroll = useCallback( () => {
		const { scrollTop, offsetHeight, scrollHeight } = autoscrollNode.current;
		const enable = scrollTop + offsetHeight >= scrollHeight;
		autoscrollEnabled.current = enable;
	}, [] );

	function setTarget( node ) {
		if ( autoscrollNode.current ) {
			autoscrollNode.current.removeEventListener( 'scroll', detectScroll );
		}

		autoscrollNode.current = node;

		if ( autoscrollNode.current ) {
			autoscrollNode.current.addEventListener( 'scroll', detectScroll );
		}
	}

	return { setTarget };
}

export const withAutoscroll = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const autoscroll = useAutoscroll();
		return <Wrapped { ...props } autoscroll={ autoscroll } />;
	},
	'WithAutoscroll'
);
