export interface MastodonConnection {
	id: number;
	// Webfinger-style display handle from the list endpoint, shaped as
	// `@user@instance`. Render as-is — do not re-prefix with `@` or
	// append `@instance`.
	handle: string;
	instance: string;
	display_name: string | null;
	// Always present in the list payload but currently returned as `null`;
	// fetch getConnection(id) to populate.
	avatar: string | null;
}

export interface MastodonConnectionsResponse {
	connections: MastodonConnection[];
}

export interface MastodonCreateConnectionResponse {
	connection: MastodonConnection;
}

export interface MastodonProfileCounts {
	followers: number;
	following: number;
	posts: number;
}

export interface MastodonConnectionDetails {
	handle: string;
	instance: string;
	display_name: string | null;
	description: string;
	avatar: string | null;
	header: string | null;
	counts: MastodonProfileCounts;
	raw: Record< string, unknown >;
}

export interface MastodonAuthorizeResponse {
	authorize_url: string;
	state: string;
}

// Mastodon Account block as projected by ReaderMastodon_Normalizer.
// Matches wpcom PR Automattic/wpcom#213513 normalizer output.
// `acct` is `username` for local accounts, `username@instance` for
// remote — the connection's instance is needed to render local
// accounts with a fully-qualified webfinger handle.
export interface MastodonTimelineAccount {
	id: string;
	username: string;
	acct: string;
	display_name: string;
	avatar: string | null;
}

export interface MastodonBoost {
	type: 'boost';
	by: MastodonTimelineAccount;
}

export interface MastodonCounts {
	replies: number;
	boosts: number;
	favourites: number;
}

// Single attachment in the flat `media` array. The `type` discriminator
// preserves the upstream Mastodon kinds; `unknown` is a forward-compat
// fallback for future Mastodon attachment types.
export interface MastodonMediaAttachment {
	type: 'image' | 'video' | 'gifv' | 'audio' | 'unknown';
	url: string;
	preview_url: string | null;
	alt: string;
	aspect_ratio: { width: number; height: number } | null;
}

// Wire shape: Mastodon's status object includes per-viewer interaction
// state. Both fields are booleans — favourited toggles via the likes
// endpoint, reblogged via reposts. Optional during the backend rollout
// window; consumers must treat missing viewer as
// "not favourited / not reblogged".
export interface MastodonFeedItemViewer {
	favourited: boolean;
	reblogged: boolean;
}

export interface MastodonFeedItem {
	id: string;
	url: string;
	created_at: string;
	account: MastodonTimelineAccount;
	content: string;
	spoiler_text: string;
	sensitive: boolean;
	language: string | null;
	in_reply_to_id: string | null;
	in_reply_to_account_id: string | null;
	boost: MastodonBoost | null;
	media: MastodonMediaAttachment[];
	counts: MastodonCounts;
	viewer?: MastodonFeedItemViewer;
}

export interface MastodonTimelinePage {
	items: MastodonFeedItem[];
	cursor: string | null;
}

// Wire shape from /reader/mastodon/connections/<id>/thread.
// Mirrors atmosphere's recursive thread shape: focal node at thread.post,
// ancestor chain via thread.parent.parent... (linked list), reply tree
// under thread.replies. Tombstone variants (not_found / blocked) cover
// soft-deleted or moderated statuses inside the thread.
export interface MastodonThreadPostNode {
	type: 'post';
	post: MastodonFeedItem;
	parent: MastodonThreadNode | null;
	replies: MastodonThreadNode[];
}

export interface MastodonThreadNotFoundNode {
	type: 'not_found';
	uri: string;
}

export interface MastodonThreadBlockedNode {
	type: 'blocked';
	uri: string;
}

export type MastodonThreadNode =
	| MastodonThreadPostNode
	| MastodonThreadNotFoundNode
	| MastodonThreadBlockedNode;

export interface MastodonThreadResponse {
	thread: MastodonThreadNode;
}

// Backend projects the home-instance Mastodon Account object. We surface
// only the fields we render plus `raw` for forward-compat (matches the
// existing MastodonConnectionDetails convention). `note` arrives sanitized
// from the wire and is sanitized again client-side (defense-in-depth).
// `id` is instance-local — same handle on a different home instance has a
// different id; we still use it as the URL key when known because the
// home-instance perspective is stable per connection. Webfinger handle
// (`acct` qualified to `@user@instance`) is the cross-instance fallback
// when only the handle is on hand. Counts are projected into the nested
// `counts` object the same way `MastodonConnectionDetails` exposes them
// (followers / following / posts), not the upstream flat `*_count` form.
export interface MastodonAuthorProfile {
	id: string;
	acct: string;
	display_name: string;
	avatar: string | null;
	header: string | null;
	note: string;
	counts: MastodonProfileCounts;
	locked: boolean;
	raw: Record< string, unknown >;
}

// Author-feed pages share the timeline page shape; alias rather than
// duplicate so a future field on MastodonTimelinePage propagates here too.
export type MastodonAuthorFeedPage = MastodonTimelinePage;

// Mirrors AtmosphereAuthorFeedFilter so panel/tabs wiring is identical
// across protocols. Mastodon's wire shape is two booleans on the same
// endpoint (exclude_replies, only_media); the fetcher does the mapping.
export type MastodonAuthorFeedFilter =
	| 'posts_no_replies'
	| 'posts_with_replies'
	| 'posts_with_media';

// Filter values that map to Mastodon's GET /api/v1/timelines/tag/:hashtag
// query params. Values mirror the UI tab slugs 1:1 so the slug ↔ filter
// map at the tabs layer is identity beyond the case of `all`.
export type MastodonTagFilter = 'all' | 'media' | 'local';

// Optional metadata embedded in the feed response. The backend MAY include
// nothing today; render hashtag name as a plain header and only show
// `count` when set.
export interface MastodonTagInfo {
	name: string;
	// Cumulative recent-post count from Mastodon's `history[]` aggregate
	// when the backend chooses to project it. Render as a "N posts" line
	// under the hashtag header; omit the line entirely when undefined.
	count?: number;
	// Home-instance Mastodon tag-page URL (e.g.
	// `https://mastodon.social/tags/rust`). Provided so we can offer an
	// external "View on Mastodon" link for users who want the home-instance
	// view.
	url?: string;
}

export interface MastodonTagFeedPage {
	items: MastodonFeedItem[];
	cursor: string | null;
	tag?: MastodonTagInfo;
}

export interface MastodonCreateLikeParams {
	connectionId: number;
	statusId: string;
}

export interface MastodonDeleteLikeParams {
	connectionId: number;
	statusId: string;
}

export interface MastodonCreateRepostParams {
	connectionId: number;
	statusId: string;
}

export interface MastodonDeleteRepostParams {
	connectionId: number;
	statusId: string;
}

/**
 * Wire-pure shape passed to `createMastodonPost`. Every field here lands
 * in the request body (or the path, in `connectionId`'s case). Do not
 * widen this type with client-only metadata — see
 * `MastodonCreatePostMutationParams` for fields the mutation layer needs
 * but the wire does not.
 */
export interface MastodonCreatePostParams {
	connectionId: number;
	status: string;
	in_reply_to_id?: string;
	/**
	 * Native Mastodon quote post (Mastodon 4.5+). Numeric status id of the
	 * post being quoted. Older instances reject the call with HTTP 400
	 * `reader_mastodon_bad_request` (mapped from upstream 422); the
	 * `createMastodonPostMutation` falls back to text-based quoting in
	 * that case (see `MastodonCreatePostMutationParams`). Do **not** also
	 * append the URL to `status` — that would double-quote on instances
	 * that support native quotes.
	 */
	quoted_status_id?: string;
}

/**
 * Variables accepted by `createMastodonPostMutation`. Extends the wire
 * shape with one client-only hint. Because this type is structurally
 * assignable to `MastodonCreatePostParams`, the type system won't stop a
 * future caller from forwarding the whole object into `createMastodonPost`
 * and leaking the hint into the request body — the actual guard is the
 * explicit destructure in `createMastodonPostWithQuoteFallback`
 * (`const { quotedFallbackPermalink, ...wireParams } = params;`). Keep
 * the split so the destructure point stays singular and obvious.
 */
export interface MastodonCreatePostMutationParams extends MastodonCreatePostParams {
	/**
	 * Client-only fallback hint. When a quote attempt fails with
	 * `bad_request`, the mutation retries once with `quoted_status_id`
	 * removed and this permalink appended to `status` (separated by a
	 * blank line). Never sent to the server — destructured off in
	 * `createMastodonPostWithQuoteFallback` before any wire call.
	 */
	quotedFallbackPermalink?: string;
}

export interface MastodonCreatePostResult {
	id: string;
	url: string;
	in_reply_to_id: string | null;
}
