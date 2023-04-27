import { useRefEffect } from '@wordpress/compose';
import type { RefObject } from 'react';

const useOverlayScroll = ( scrollableRef: RefObject< any > ) => {
	return useRefEffect(
		( node ) => {
			if ( ! scrollableRef ) {
				return;
			}

			const onWheel = ( event: Event ) => {
				const { deltaX, deltaY } = event as WheelEvent;
				scrollableRef.current?.scrollBy( deltaX, deltaY );
			};

			// Tell the browser that we do not call event.preventDefault
			// See https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener#improving_scrolling_performance_with_passive_listeners
			node.addEventListener( 'wheel', onWheel, { passive: true } );
			return () => {
				node.removeEventListener( 'wheel', onWheel );
			};
		},
		[ scrollableRef ]
	);
};

export default useOverlayScroll;
