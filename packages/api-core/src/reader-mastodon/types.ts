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
// from the wire and is sanitized again client-side (defense-in-depth);
// `SocialProfileCard` consumes it through its `bioHtml` slot. The full
// profile shape does NOT carry a plain-text bio — the row variant
// (`MastodonAccountSummary`) projects `note_text` for compact surfaces.
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
	/**
	 * Relationship state from the connected account's perspective. Absent
	 * on backends that haven't deployed the viewer projection yet —
	 * consumers must treat undefined as "no follow UI available" rather
	 * than synthesizing a default, which would mislead users into
	 * clicking Follow on accounts they already follow.
	 */
	viewer?: MastodonAuthorProfileViewer;
	/**
	 * `true` when the resolved actor matches the connection's own account.
	 * Absent on backends that haven't deployed the projection yet. The
	 * panel hides the follow button on `is_self === true`.
	 */
	is_self?: boolean;
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
 * Per-instance composer limits, projected by the wpcom backend from the
 * home instance's `/api/v2/instance` (or v1) endpoint. Stock Mastodon
 * defaults to `max_characters: 500`; instances commonly raise it (some
 * self-hosted instances run 5000+). Older Mastodon / Pleroma /
 * GoToSocial expose `max_toot_chars` instead — the backend collapses
 * both to `max_characters`.
 *
 * Slice A (CM-677) only surfaces `max_characters`. `characters_reserved_per_url`
 * is purely a server-side cap-counting detail and doesn't affect display,
 * and `max_media_attachments` matters only once Mastodon image upload ships.
 */
export interface MastodonInstanceConfig {
	max_characters: number;
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
	// Slice 8a: optional media attachments + sensitive flag.
	media_ids?: string[];
	sensitive?: boolean;
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

// Slice 8a: image attachments via `POST /reader/mastodon/connections/{id}/media`.
export interface MastodonMediaUploadParams {
	connectionId: number;
	file: File;
	// Alt text passed through to the instance as the `description` form field.
	// Mastodon does not let us update alt text after upload via the wpcom backend,
	// so this is the only opportunity to set it.
	description?: string;
}

export interface MastodonMediaUploadResult {
	id: string;
	type: 'image' | 'video' | 'gifv' | 'audio' | 'unknown';
	// `null` when the instance returns 202 (still processing). Mastodon's
	// `POST /api/v1/statuses` accepts media_ids whose backing media is still
	// processing — it queues the status until processing completes — so callers
	// pass the id through regardless.
	url: string | null;
	preview_url: string | null;
	description: string;
}

/**
 * Caller-relative relationship state on the scoped Mastodon profile
 * endpoint. Optional during the backend rollout window — the absence of
 * this block means the backend hasn't deployed the viewer projection
 * yet, and consumers should treat that as "no follow UI available".
 */
export interface MastodonAuthorProfileViewer {
	/** Whether the caller follows the target. */
	following: boolean;
	/** Whether the target follows the caller. Drives the "Follow back" affordance. */
	followed_by: boolean;
	/**
	 * Whether the caller has a pending follow request. Set when following
	 * a locked account; unlocked accounts transition straight to
	 * `following: true`.
	 */
	requested: boolean;
}

export interface MastodonCreateFollowParams {
	connectionId: number;
	/** Numeric Mastodon account id. Webfinger handles must be resolved first. */
	accountId: string;
}

export interface MastodonDeleteFollowParams {
	connectionId: number;
	/** Numeric Mastodon account id. */
	accountId: string;
}

/**
 * Response shape returned by both the create-follow and delete-follow
 * endpoints. The wpcom backend projects the upstream Mastodon
 * `Relationship` object into a uniform `viewer` block so optimistic +
 * server-state updates use the same patcher.
 */
export interface MastodonFollowResponse {
	viewer: MastodonAuthorProfileViewer;
}

export interface MastodonAuthStatus {
	needs_reauth: boolean;
}

/**
 * Slim Mastodon Account shape returned by the followers / following list
 * endpoints. Mirrors the fields the wpcom backend's row normaliser projects:
 * profile-card surface fields plus per-viewer relationship state. `note` is
 * sanitised server-side through the FEP-b2b8 allow-list (same subset as
 * status `content`); `note_text` is the plain-text projection (HTML stripped
 * server-side) so the row can render in compact form without un-rendering
 * the HTML on the client. Mirrors AtmosphereProfileSummary's choice to
 * expose a plain-text `description` field for list rows (Atmosphere's
 * `description_html` companion lives on the full profile only).
 */
export interface MastodonAccountSummary {
	id: string;
	username: string;
	acct: string;
	/**
	 * Bare webfinger handle (`user@instance`) synthesised server-side from
	 * `acct` + connection's home instance. Mirrors the ATmosphere row
	 * convention where `handle` is bare (`alice.bsky.social`); the display
	 * layer (`SocialAccountRow`) renders the `@` prefix once.
	 */
	handle: string;
	display_name: string;
	note: string;
	note_text: string;
	avatar: string | null;
	locked: boolean;
	viewer: MastodonAuthorProfileViewer;
	/** `true` when the row matches the connection's own account id; the server skips the relationships call for this row. */
	is_self: boolean;
}

export interface MastodonAccountSummariesPage {
	items: MastodonAccountSummary[];
	cursor: string | null;
}
