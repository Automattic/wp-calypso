import type { ReadSpace, ReadSpaceDetails, SpaceColor, SpaceIcon } from './types';

/**
 * Wire shape returned by the wpcom/v2 Spaces endpoints (list, single, create).
 * Differs from the client `ReadSpace`: numeric id, `title` not `name`, and flat
 * `layout_color`/`layout_icon` rather than a nested `layout` object.
 */
export interface ReadSpaceApiItem {
	id: number;
	title: string;
	sites: number[];
	tags: string[];
	layout_color: SpaceColor;
	layout_icon: SpaceIcon;
	// Returned by the list/detail endpoints but not by `POST /reader/spaces/new`.
	slug?: string;
	owner_id?: number;
	created?: string;
}

/**
 * Map a wpcom/v2 response item onto the client `ReadSpace` (list) shape,
 * nesting the flat `layout_color`/`layout_icon` fields under `layout`.
 */
export function adaptReadSpace( item: ReadSpaceApiItem ): ReadSpace {
	return {
		id: String( item.id ),
		name: item.title,
		tags: item.tags ?? [],
		layout: { color: item.layout_color, icon: item.layout_icon },
	};
}

/**
 * Map a wpcom/v2 response item onto the client `ReadSpaceDetails` shape.
 *
 * TODO(RSM-4145): the detail/sources endpoint isn't wired yet, so `sources` is
 * empty here. A freshly created space has no sources, so this is correct for the
 * create response; hydrating `sites` into real `SpaceSource`s lands with detail.
 */
export function adaptReadSpaceDetails( item: ReadSpaceApiItem ): ReadSpaceDetails {
	return {
		...adaptReadSpace( item ),
		sources: [],
	};
}
