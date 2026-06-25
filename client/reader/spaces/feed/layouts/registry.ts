import { BoardLayout } from './board';
import { GalleryLayout } from './gallery';
import { LegacyLayout } from './legacy';
import { MagazineLayout } from './magazine';
import { StandardListLayout } from './standard-list';
import type { SpaceFeedLayoutProps } from './types';
import type { SpaceFeedLayout } from '@automattic/api-core';
import type { ComponentType } from 'react';

const LAYOUTS: Record< SpaceFeedLayout, ComponentType< SpaceFeedLayoutProps > > = {
	'standard-list': StandardListLayout,
	magazine: MagazineLayout,
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
