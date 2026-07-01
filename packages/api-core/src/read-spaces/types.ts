import type { SiteSubscriptionItem } from '../read-follows';

/**
 * Reader Spaces — a Space groups followed feeds (`sources`) and followed tags
 * under a name (see RSM-4110).
 *
 * `color` and `icon` are serializable presentation hints (string keys, not
 * rendered glyphs); the client maps `icon` to a `@wordpress/icons` element and
 * `color` to a CSS variant. The API does not validate these against the lists
 * below — it only sanitizes — so the client constrains the picker.
 */
export type SpaceColor =
	| 'blue'
	| 'purple'
	| 'red'
	| 'orange'
	| 'gray'
	| 'green'
	| 'celadon'
	| 'pink';

/**
 * Accent applied to a space's post text (titles + actions). `'none'` keeps the
 * text neutral — the same reading experience as the rest of the Reader — while
 * the space icon can still carry its own color via `iconColor`.
 */
export type SpaceTextColor = SpaceColor | 'none';

export type SpaceIcon =
	| 'inbox'
	| 'box'
	| 'video'
	| 'comment'
	| 'cart'
	| 'star'
	| 'pages'
	| 'category'
	| 'globe'
	| 'tag'
	| 'rss'
	| 'people'
	| 'home'
	| 'gallery'
	| 'chart'
	| 'palette';

/**
 * How a space renders its feed. Each value selects a distinct list geometry —
 * `standard-list` (dense vertical list), `gallery` (grid), `board` (masonry),
 * `legacy` (the classic Reader stream: InfiniteList + post cards). Unset falls
 * back to `standard-list`.
 */
export type SpaceFeedLayout = 'standard-list' | 'gallery' | 'board' | 'legacy';

/**
 * Presentation settings for a space, grouped so they can grow beyond color and
 * icon (e.g. cover image, sort order) without widening `ReadSpace` itself.
 */
export interface SpaceLayout {
	// Accent for the space's post text (titles + actions); `'none'` = neutral.
	color: SpaceTextColor;
	// Color for the space's icon. Falls back to `color` when absent, so spaces
	// created before the icon and text colors were split keep a colored icon.
	iconColor?: SpaceColor;
	icon: SpaceIcon;
	// Which feed layout to render.
	view?: SpaceFeedLayout;
}

/**
 * Summary shape returned by the list endpoint (`GET /reader/spaces`). The list
 * is slim — no `sources` or `tags`; fetch the detail endpoint for those.
 */
export interface ReadSpace {
	id: string;
	name: string;
	layout: SpaceLayout;
}

/**
 * A space plus its followed feeds (`sources`) and tags. Returned by every
 * endpoint except the list — the detail GET, create, update, and the feed
 * mutations all resolve a `ReadSpaceDetails`.
 */
export interface ReadSpaceDetails extends ReadSpace {
	sources: SpaceSource[];
	tags: string[];
}

export interface CreateReadSpaceParams {
	name: string;
	// All optional on the API. Tags must be existing Reader tag slugs and feeds
	// must be existing feeds (feed id or url); either rejects the whole request
	// if unresolvable.
	tags?: string[];
	feeds?: Array< number | string >;
	layout?: Partial< SpaceLayout >;
}

/**
 * Params for `PUT /reader/spaces/{id}`. Send only the fields you are changing; at
 * least one is required. `tags` and `feeds` are full replaces (pass `[]` to
 * clear); `layout` is a partial merge — send `{ color }` to change only the
 * colour; the icon is kept.
 */
export interface UpdateReadSpaceParams {
	name?: string;
	tags?: string[];
	feeds?: Array< number | string >;
	layout?: Partial< SpaceLayout >;
}

/**
 * Result of `POST /reader/spaces/{id}/delete`. Deletion is a permanent hard
 * delete — there is no trash/undo.
 */
export interface ReadSpaceDeletionResult {
	deleted: boolean;
	id: number;
}

/**
 * A feed followed by a space. The API calls these `follows`; the client keeps
 * the `sources` vocabulary. `feedId` is the numeric feedbag id used to remove
 * the feed; `blogId` is null for external (non-WP/Jetpack) feeds; `name`/`icon`
 * may be null when feedbag has none.
 */
export interface SpaceSource {
	feedId: number;
	feedUrl: string;
	blogId: number | null;
	name: string | null;
	siteIcon: string | null;
}

export interface ReadSpaceSourceMutationParams {
	spaceId: string;
	subscription: SiteSubscriptionItem;
}
