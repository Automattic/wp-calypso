import { useEffect, useMemo, useRef, useState } from 'react';
import type { AgencyEnablementResource } from '@automattic/api-core';

const PAGE_SIZE = 24;

/**
 * Reveals resources a page at a time, starting over whenever `resetKey`
 * changes. Each reveal moves focus to the first resource it adds, rather than
 * leaving it on the button, or losing it when the button goes; attach
 * `containerRef` to an element holding the resources' links.
 */
export function useRevealMore( resources: AgencyEnablementResource[], resetKey: string ) {
	const [ shown, setShown ] = useState( { key: resetKey, count: PAGE_SIZE } );
	const visibleCount = shown.key === resetKey ? shown.count : PAGE_SIZE;
	const visibleResources = useMemo(
		() => resources.slice( 0, visibleCount ),
		[ resources, visibleCount ]
	);

	const containerRef = useRef< HTMLDivElement >( null );
	const focusAfterReveal = useRef< number | null >( null );
	useEffect( () => {
		if ( focusAfterReveal.current !== null ) {
			containerRef.current
				?.querySelector< HTMLElement >( `[data-resource-id="${ focusAfterReveal.current }"]` )
				?.focus();
			focusAfterReveal.current = null;
		}
	}, [ visibleResources ] );

	const revealMore = () => {
		focusAfterReveal.current = resources[ visibleCount ].id;
		setShown( { key: resetKey, count: visibleCount + PAGE_SIZE } );
	};

	return {
		visibleResources,
		hasMore: visibleCount < resources.length,
		revealMore,
		containerRef,
	};
}
