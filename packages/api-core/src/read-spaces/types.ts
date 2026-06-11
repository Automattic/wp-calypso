import type { SiteSubscriptionItem } from '../read-follows';

/**
 * Reader Spaces — a Space groups subscriptions under a name plus optional tags.
 * v0 has a name and tags only, no description (see RSM-4110).
 *
 * `color` and `icon` are serializable presentation hints (string keys, not
 * rendered glyphs); the client maps `icon` to a `@wordpress/icons` element and
 * `color` to a CSS variant. RSM-4119 will replace the seeded list with real,
 * server-derived data.
 */
export type SpaceColor = 'blue' | 'purple' | 'red' | 'orange' | 'gray' | 'green' | 'celadon';

export type SpaceIcon =
	| 'inbox'
	| 'box'
	| 'video'
	| 'comment'
	| 'cart'
	| 'star'
	| 'pages'
	| 'category';

/**
 * Presentation settings for a space, grouped so they can grow beyond color and
 * icon (e.g. cover image, sort order) without widening `ReadSpace` itself.
 */
export interface SpaceLayout {
	color: SpaceColor;
	icon: SpaceIcon;
}

export interface ReadSpace {
	id: string;
	name: string;
	tags: string[];
	layout: SpaceLayout;
}

/**
 * A space plus its sources. Sources are only returned by the single-space
 * endpoint (`GET /read/spaces/{id}`), not by the list endpoint — so the list
 * deals in `ReadSpace` and the detail view deals in `ReadSpaceDetails`.
 */
export interface ReadSpaceDetails extends ReadSpace {
	sources: SpaceSource[];
}

export interface CreateReadSpaceParams {
	name: string;
	tags: string[];
}

export interface SpaceSource {
	feedId?: number | string | null;
	blogId?: number | string | null;
	feedUrl: string;
	siteUrl: string;
	name: string;
	siteIcon?: string | null;
}

export interface ReadSpaceSourceMutationParams {
	spaceId: string;
	subscription: SiteSubscriptionItem;
}
