import type { ReadSpace, ReadSpaceDetails, SpaceLayout, SpaceSource } from './types';

/**
 * A followed feed as returned in a detail response's `follows` array. The client
 * calls these `sources`; see `adaptSpaceSource`.
 */
export interface ReadSpaceFollowApiItem {
	feed_id: number;
	feed_url: string;
	blog_id: number | null;
	name: string | null;
	icon: string | null;
}

/**
 * Wire shape for a space. The list (summary) endpoint returns only `id`,
 * `title`, `layout`; every other endpoint returns the same plus `follows` and
 * `tags` (the detail shape). Differs from the client model: numeric id, `title`
 * not `name`, and `follows` rather than `sources`. `layout` is now an object
 * (`{ color, icon }`), matching the client `SpaceLayout`.
 */
export interface ReadSpaceApiItem {
	id: number;
	title: string;
	layout: SpaceLayout;
	// Detail-only — absent on the list (summary) response.
	follows?: ReadSpaceFollowApiItem[];
	tags?: string[];
}

/** Map a wpcom/v2 summary item onto the client `ReadSpace` (list) shape. */
export function adaptReadSpace( item: ReadSpaceApiItem ): ReadSpace {
	const layout: SpaceLayout = { color: item.layout.color, icon: item.layout.icon };
	if ( item.layout.iconColor ) {
		layout.iconColor = item.layout.iconColor;
	}
	if ( item.layout.view ) {
		layout.view = item.layout.view;
	}
	return {
		id: String( item.id ),
		name: item.title,
		// `iconColor` and `view` are forward-looking: the API does not return them
		// yet (they stay `undefined`), but mapping them now means they flow through
		// once it does.
		layout,
	};
}

/** Map a wire `follows[]` entry onto the client `SpaceSource` shape. */
function adaptSpaceSource( follow: ReadSpaceFollowApiItem ): SpaceSource {
	return {
		feedId: follow.feed_id,
		feedUrl: follow.feed_url,
		blogId: follow.blog_id,
		name: follow.name,
		siteIcon: follow.icon,
	};
}

/**
 * Map a wpcom/v2 detail item onto the client `ReadSpaceDetails` shape, mapping
 * the wire `follows` array onto `sources` and carrying the tag slugs through.
 */
export function adaptReadSpaceDetails( item: ReadSpaceApiItem ): ReadSpaceDetails {
	return {
		...adaptReadSpace( item ),
		sources: ( item.follows ?? [] ).map( adaptSpaceSource ),
		tags: item.tags ?? [],
	};
}
