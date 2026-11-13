import { useEffect, useRef, type RefObject } from 'react';

/**
 * Scrolls an anchored tool or group into view on the MCP read/write pages.
 *
 * A tool row only renders once its group is open, so the scroll waits for the
 * render that adds the target. Before scrolling, the page gets the bottom edge
 * of the stuck toolbar as `--mcp-tools-toolbar-bottom`, which `.mcp-tools-anchor`
 * uses as its scroll margin so the target isn't hidden under the toolbar.
 */
export default function useAnchorScroll(
	pageRef: RefObject< HTMLElement | null >,
	toolbarRef: RefObject< HTMLElement | null >
) {
	const pendingAnchor = useRef< string | null >( null );

	useEffect( () => {
		const anchor = pendingAnchor.current;
		const target = anchor ? document.getElementById( anchor ) : null;
		if ( ! target ) {
			return;
		}
		pendingAnchor.current = null;

		const page = pageRef.current;
		const toolbar = toolbarRef.current;
		if ( page && toolbar ) {
			// The sticky offset, not the current position: on load the toolbar
			// hasn't stuck yet, but it has by the time the scroll ends.
			const stuckTop = parseFloat( window.getComputedStyle( toolbar ).top ) || 0;
			page.style.setProperty(
				'--mcp-tools-toolbar-bottom',
				`${ stuckTop + toolbar.offsetHeight }px`
			);
		}
		target.scrollIntoView?.( { block: 'start' } );
	} );

	return ( anchor: string ) => {
		pendingAnchor.current = anchor;
	};
}
