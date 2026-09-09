import type { SiteSubscriptionItem } from '../read-follows';

/**
 * Reader Shelves — a Shelf groups followed feeds (`sources`) and followed tags
 * under a name (see RSM-4110).
 *
 * `color` and `icon` are serializable presentation hints (string keys, not
 * rendered glyphs); the client maps `icon` to a `@wordpress/icons` element and
 * `color` to a CSS variant. The API does not validate these against the lists
 * below — it only sanitizes — so the client constrains the picker.
 */
export type ShelfColor =
	| 'blue'
	| 'purple'
	| 'red'
	| 'orange'
	| 'gray'
	| 'green'
	| 'celadon'
	| 'pink';

/**
 * Accent applied to a shelf's post text (titles + actions). `'none'` keeps the
 * text neutral — the same reading experience as the rest of the Reader — while
 * the shelf icon can still carry its own color via `iconColor`.
 */
export type ShelfTextColor = ShelfColor | 'none';

export type ShelfIcon =
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
 * How a shelf renders its feed. Each value selects a distinct list geometry —
 * `standard-list` (dense vertical list), `gallery` (grid), `board` (masonry),
 * `legacy` (the classic Reader stream: InfiniteList + post cards). Unset falls
 * back to `standard-list`.
 */
export type ShelfFeedLayout = 'standard-list' | 'gallery' | 'board' | 'legacy';

/**
 * Column width of the shelf feed — `regular` is the narrow single reading column
 * shared with the rest of the Reader; `wide` is the roomy layout. Unset falls
 * back to `wide` so shelves created before this shipped keep their current width.
 */
export type ShelfLayoutWidth = 'regular' | 'wide';

/**
 * Presentation settings for a shelf, grouped so they can grow beyond color and
 * icon (e.g. cover image, sort order) without widening `ReadShelf` itself.
 */
export interface ShelfLayout {
	// Accent for the shelf's post text (titles + actions); `'none'` = neutral.
	color: ShelfTextColor;
	// Color for the shelf's icon. Falls back to `color` when absent, so shelves
	// created before the icon and text colors were split keep a colored icon.
	iconColor?: ShelfColor;
	icon: ShelfIcon;
	// Which feed layout to render.
	view?: ShelfFeedLayout;
	// Column width of the shelf feed. Unset falls back to `wide`.
	width?: ShelfLayoutWidth;
}

/**
 * Summary shape returned by the list endpoint (`GET /reader/shelves`). The list
 * is slim — no `sources` or `tags`; fetch the detail endpoint for those.
 */
export interface ReadShelf {
	id: string;
	// `sanitize_title( name )`, derived and kept unique-per-owner server-side. Used
	// to address a shelf in the URL; it re-syncs on every rename (so it can change),
	// while `id` stays the stable key for mutations and streams.
	slug: string;
	name: string;
	layout: ShelfLayout;
}

/**
 * A shelf plus its followed feeds (`sources`) and tags. Returned by every
 * endpoint except the list — the detail GET, create, update, and the feed
 * mutations all resolve a `ReadShelfDetails`.
 */
export interface ReadShelfDetails extends ReadShelf {
	sources: ShelfSource[];
	tags: string[];
	// Base ES language codes (e.g. `en`, `pt`) the shelf's tag results are
	// filtered to. The server normalizes whatever it's sent to base codes (region
	// stripped, lowercased, validated, de-duped) and echoes the canonical list
	// back here, so it may differ from what was submitted. Empty means unset (the
	// server falls back to the viewer's interface locale).
	languages: string[];
}

export interface CreateReadShelfParams {
	name: string;
	// All optional on the API. Tags must be existing Reader tag slugs and feeds
	// must be existing feeds (feed id or url); either rejects the whole request
	// if unresolvable.
	tags?: string[];
	feeds?: Array< number | string >;
	// Base ES language codes (e.g. `en`, `pt`). The server normalizes to base
	// codes and silently drops unknown ones, so the persisted set may be a subset.
	languages?: string[];
	layout?: Partial< ShelfLayout >;
}

/**
 * Params for `PUT /reader/shelves/{id}`. Send only the fields you are changing; at
 * least one is required. `tags` and `feeds` are full replaces (pass `[]` to
 * clear); `layout` is a partial merge — send `{ color }` to change only the
 * colour; the icon is kept.
 */
export interface UpdateReadShelfParams {
	name?: string;
	tags?: string[];
	feeds?: Array< number | string >;
	// Full replace of the shelf's base language codes (pass `[]` to clear). The
	// server normalizes to base codes and drops unknown ones; see
	// `CreateReadShelfParams.languages`.
	languages?: string[];
	layout?: Partial< ShelfLayout >;
}

/**
 * Result of `POST /reader/shelves/{id}/delete`. Deletion is a permanent hard
 * delete — there is no trash/undo.
 */
export interface ReadShelfDeletionResult {
	deleted: boolean;
	id: number;
}

/**
 * A feed followed by a shelf. The API calls these `follows`; the client keeps
 * the `sources` vocabulary. `feedId` is the numeric feedbag id used to remove
 * the feed; `blogId` is null for external (non-WP/Jetpack) feeds; `name`/`icon`
 * may be null when feedbag has none.
 */
export interface ShelfSource {
	feedId: number;
	feedUrl: string;
	blogId: number | null;
	name: string | null;
	siteIcon: string | null;
}

export interface ReadShelfSourceMutationParams {
	shelfId: string;
	subscription: SiteSubscriptionItem;
}
