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
