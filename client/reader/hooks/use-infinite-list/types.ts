import type { VirtualItem } from '@tanstack/react-virtual';
import type { CSSProperties } from 'react';

/** Where to place the target within the viewport. `'auto'` scrolls the least to reveal it. */
export type ScrollAlign = 'start' | 'center' | 'end' | 'auto';

export interface UseInfiniteListOptions {
	/** The scrollable container. Pass as state (not a ref) so the virtualizer re-evaluates once it mounts. */
	scrollElement: HTMLElement | null;
	/** Number of items the virtualizer counts. The consumer decides what an index means (item, row, …). */
	count: number;
	/** Estimated item size in px — a constant or a per-index function (e.g. by item kind). */
	estimateSize: number | ( ( index: number ) => number );
	/** Stable, content-derived key per index. Indexes the size + lane caches, so it must not change for the same item. */
	getItemKey: ( index: number ) => string | number;
	overscan?: number;
	/** Number of columns for masonry packing. Omit (or 1) for a single-lane list. */
	lanes?: number;
	/** Gap in px between items (use this instead of CSS margins, which distort measurement). */
	gap?: number;
	/**
	 * `'end'` keeps the viewport visually stable when items are added/removed at an
	 * edge — e.g. prepending new posts at the top doesn't push the current view down.
	 * Requires a stable, content-derived `getItemKey` (the anchor is tracked by key).
	 * Default `'start'` (top-anchored, standard list).
	 */
	anchorTo?: 'start' | 'end';
	hasMore?: boolean;
	/** True while a next page is already loading — gates `loadMore`. */
	isLoadingMore?: boolean;
	loadMore?: () => void;
	/** Stable key under which to save/restore scroll on unmount/remount (e.g. on Back). */
	restoreKey?: string;
}

/** Props to spread onto the element that holds the items. */
export interface ListContainerProps {
	ref: ( node: HTMLElement | null ) => void;
	className?: string;
	style: CSSProperties;
}

export interface UseInfiniteListResult {
	/**
	 * Spread onto the element that holds the items. Enforces the positioning +
	 * sizing the virtualizer needs (`position: relative`, `block-size: totalSize`),
	 * while merging any `className` / `style` you pass.
	 */
	getListProps: ( props?: { className?: string; style?: CSSProperties } ) => ListContainerProps;
	/** The windowed items to render. */
	items: VirtualItem[];
	/**
	 * Offset (px) from the scroll container's top to the list's top. Subtract it
	 * from each item's `start` when positioning — `translateY(start - scrollMargin)` —
	 * since `start` is measured from the scroll container but items sit within the
	 * list element below it. Usually 0 in tests / top-anchored lists.
	 */
	scrollMargin: number;
	/** Attach to each rendered item element so it can be measured. */
	measureElement: ( node: Element | null ) => void;
	/** Scroll an item into view (accounts for scrollMargin + measured sizes). */
	scrollToIndex: ( index: number, options?: { align?: ScrollAlign } ) => void;
	/** Scroll to an absolute pixel offset within the scroll container. */
	scrollToOffset: ( offset: number, options?: { align?: ScrollAlign } ) => void;
}
