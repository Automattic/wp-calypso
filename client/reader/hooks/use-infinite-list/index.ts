import { useVirtualizer } from '@tanstack/react-virtual';
import { useState } from 'react';
import { useLoadMore } from './use-load-more';
import { useScrollMargin } from './use-scroll-margin';
import { readScrollSnapshot, useScrollRestore } from './use-scroll-restore';
import type { UseInfiniteListOptions, UseInfiniteListResult } from './types';

export type {
	UseInfiniteListOptions,
	UseInfiniteListResult,
	ListContainerProps,
	ScrollAlign,
} from './types';
export { ScrollDebugOverlay } from './scroll-debug';

const noop = () => {};

/**
 * ⚠️ EXPERIMENTAL / UNSTABLE — Reader-internal, the API may change without
 * notice. Built for the Spaces feed proof-of-concept; not yet a stable,
 * general-purpose engine. Don't depend on it from outside `client/reader` until
 * it stabilizes.
 *
 * Headless engine for a virtualized, infinite-scrolling list over TanStack
 * Virtual. Bundles the mechanics shared by every feed layout — windowing, the
 * scroll margin, infinite loading, scroll restoration and edge anchoring — and
 * returns the windowed items plus helpers. The consumer owns all markup: it
 * decides what an index means (a single item, a chunked grid row, a masonry
 * tile) and how to position and render it.
 * @example
 * const { getListProps, items, measureElement, scrollMargin } = useInfiniteList( {
 * 	scrollElement,
 * 	count: posts.length,
 * 	estimateSize: 420,
 * 	getItemKey: ( i ) => posts[ i ].ID,
 * 	hasMore,
 * 	isLoadingMore,
 * 	loadMore,
 * } );
 * return (
 * 	<div { ...getListProps( { className: 'magazine-feed' } ) }>
 * 		{ items.map( ( vi ) => (
 * 			<div
 * 				key={ vi.key }
 * 				ref={ measureElement }
 * 				style={ { position: 'absolute', inlineSize: '100%', transform: `translateY(${ vi.start - scrollMargin }px)` } }
 * 			>
 * 				<MagazineCard post={ posts[ vi.index ] } />
 * 			</div>
 * 		) ) }
 * 	</div>
 * );
 */
export function useInfiniteList( {
	scrollElement,
	count,
	estimateSize,
	getItemKey,
	overscan,
	lanes,
	gap,
	anchorTo,
	hasMore = false,
	isLoadingMore = false,
	loadMore,
	restoreKey,
}: UseInfiniteListOptions ): UseInfiniteListResult {
	// State (not a ref) so the scroll margin recomputes once the list attaches.
	const [ listElement, setListElement ] = useState< HTMLElement | null >( null );
	const scrollMargin = useScrollMargin( listElement, scrollElement );
	const sizeFn = typeof estimateSize === 'number' ? () => estimateSize : estimateSize;
	const snapshot = readScrollSnapshot( restoreKey );

	const virtualizer = useVirtualizer< HTMLElement, Element >( {
		count,
		getScrollElement: () => scrollElement,
		estimateSize: sizeFn,
		getItemKey,
		overscan,
		lanes,
		gap,
		anchorTo,
		scrollMargin,
		initialMeasurementsCache: snapshot?.measurements,
		initialOffset: snapshot?.offset,
	} );

	const items = virtualizer.getVirtualItems();
	useLoadMore( {
		lastIndex: items[ items.length - 1 ]?.index,
		count,
		hasMore,
		isLoadingMore,
		loadMore: loadMore ?? noop,
	} );
	useScrollRestore( virtualizer, restoreKey );

	return {
		getListProps: ( props = {} ) => ( {
			ref: setListElement,
			className: props.className,
			// Consumer styles first; the two the virtualizer relies on are enforced last.
			style: { ...props.style, position: 'relative', blockSize: virtualizer.getTotalSize() },
		} ),
		items,
		scrollMargin,
		measureElement: virtualizer.measureElement,
		scrollToIndex: virtualizer.scrollToIndex,
		scrollToOffset: virtualizer.scrollToOffset,
	};
}
