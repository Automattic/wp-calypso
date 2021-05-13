/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import { createHigherOrderComponent } from '@wordpress/compose';

function createScrollbleed() {
	let scrollbleedNode = null;

	function handleScroll( e ) {
		let delta = null;
		if ( ! scrollbleedNode ) {
			return;
		}

		e = e || window.event;
		if ( e.preventDefault ) {
			e.preventDefault();
		}
		e.returnValue = false;

		// scroll the window itself using JS
		// this is not perfect, we're basically guessing at how much your wheel usually scrolls
		if ( e === 'DOMMouseScroll' ) {
			// old FF
			delta = e.detail * -10;
		} else if ( e.wheelDelta ) {
			// webkit
			delta = e.wheelDelta / 8;
		} else if ( e.deltaY ) {
			// new FF
			if ( e.deltaMode && e.deltaMode === 0 ) {
				// scrolling pixels
				delta = -1 * e.deltaY;
			} else if ( e.deltaMode && e.deltaMode === 1 ) {
				// scrolling lines
				delta = -1 * e.deltaY * 15;
			} else {
				// fallback
				delta = -1 * e.deltaY * 10;
			}
		}

		scrollbleedNode.scrollTop -= delta;
	}

	return {
		setTarget( node ) {
			scrollbleedNode = node;
		},
		lock() {
			window.addEventListener( 'wheel', handleScroll, { passive: false } );
		},
		unlock() {
			window.removeEventListener( 'wheel', handleScroll );
		},
	};
}
/**
 * A hook that prevents scrolling events triggered by the mousewheel from moving scrollable containers
 * not directly under the mouse.
 *
 * By default when scrolling a scrollable HTML element, once the boundary is reached the scrolling events
 * will continue up the DOM tree and ultimately end up scrolling the page.
 *
 */
export function useScrollbleed() {
	const [ scrollbleed ] = useState( createScrollbleed );

	useEffect( () => scrollbleed.unlock, [ scrollbleed ] );

	return scrollbleed;
}

export const withScrollbleed = createHigherOrderComponent(
	( Wrapped ) => ( props ) => {
		const scrollbleed = useScrollbleed();
		return <Wrapped { ...props } scrollbleed={ scrollbleed } />;
	},
	'WithScrollbleed'
);
