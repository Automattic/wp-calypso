import { BoardLayout, BoardSkeleton } from './board';
import { GalleryLayout, GallerySkeleton } from './gallery';
import { LegacyLayout } from './legacy';
import { StandardListLayout, StandardListSkeleton } from './standard-list';
import type { SpaceFeedLayoutProps, SpaceFeedSkeletonProps } from './types';
import type { SpaceFeedLayout } from '@automattic/api-core';
import type { ComponentType } from 'react';

const LAYOUTS: Record< SpaceFeedLayout, ComponentType< SpaceFeedLayoutProps > > = {
	'standard-list': StandardListLayout,
	gallery: GalleryLayout,
	board: BoardLayout,
	legacy: LegacyLayout,
};

export const DEFAULT_SPACE_FEED_LAYOUT: SpaceFeedLayout = 'standard-list';

/**
 * Resolve a space's feed layout to its component, falling back to the standard
 * list when the value is missing or names a layout that isn't built.
 */
export function getLayout(
	layout: SpaceFeedLayout | undefined
): ComponentType< SpaceFeedLayoutProps > {
	return ( layout && LAYOUTS[ layout ] ) || LAYOUTS[ DEFAULT_SPACE_FEED_LAYOUT ];
}

/**
 * Per-layout page size for the space posts stream. Layouts not listed here fall
 * back to the stream's default; the gallery asks for 9 to fill its 3-column grid
 * evenly (3 rows of 3 per page).
 */
const LAYOUT_PAGE_SIZE: Partial< Record< SpaceFeedLayout, number > > = {
	gallery: 9,
};

export function getLayoutPageSize( layout: SpaceFeedLayout | undefined ): number | undefined {
	return layout ? LAYOUT_PAGE_SIZE[ layout ] : undefined;
}

/**
 * Per-layout loading skeleton. Each curated layout renders placeholder cards in
 * its own shape; the legacy layout has none (it owns its own loading via
 * `ReaderStreamV2`), so it falls back to the shell's generic loading state.
 */
const LAYOUT_SKELETONS: Partial<
	Record< SpaceFeedLayout, ComponentType< SpaceFeedSkeletonProps > >
> = {
	'standard-list': StandardListSkeleton,
	gallery: GallerySkeleton,
	board: BoardSkeleton,
};

export function getLayoutSkeleton(
	layout: SpaceFeedLayout | undefined
): ComponentType< SpaceFeedSkeletonProps > | undefined {
	return layout ? LAYOUT_SKELETONS[ layout ] : undefined;
}

/**
 * Layouts that render their own load-more placeholders inline (so they continue
 * the grid/list flow rather than appending a separate skeleton block at the
 * foot). The shell suppresses its foot skeleton for these while loading more.
 */
const LAYOUTS_WITH_INLINE_LOAD_MORE: Partial< Record< SpaceFeedLayout, boolean > > = {
	gallery: true,
};

export function getLayoutInlineLoadMore( layout: SpaceFeedLayout | undefined ): boolean {
	return !! ( layout && LAYOUTS_WITH_INLINE_LOAD_MORE[ layout ] );
}
