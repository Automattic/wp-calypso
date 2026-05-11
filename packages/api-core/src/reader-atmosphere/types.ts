export interface AtmosphereConnection {
	id: number;
	did: string;
	handle: string;
	display_name: string | null;
	// The list endpoint always returns null. Real avatars come from
	// getConnection(id).
	avatar: string | null;
}

export interface AtmosphereConnectionsResponse {
	connections: AtmosphereConnection[];
}

export interface AtmosphereCreateConnectionResponse {
	connection: AtmosphereConnection;
}

export interface AtmosphereProfileCounts {
	followers: number;
	follows: number;
	posts: number;
}

export interface AtmosphereConnectionDetails {
	did: string;
	handle: string;
	display_name: string | null;
	description: string;
	avatar: string | null;
	banner: string | null;
	counts: AtmosphereProfileCounts;
}

export interface AtmosphereAuthor {
	did: string;
	handle: string;
	display_name: string;
	avatar: string | null;
}

export interface AtmosphereReplyRef {
	uri: string;
	// Strong-ref CID for the referenced record. AT-Proto's reply pointers
	// are `com.atproto.repo.strongRef` pairs ({uri, cid}), so the upstream
	// data always carries it. Optional in the typed wire shape during the
	// backend rollout window — older normalizer revisions emit `{uri, author}`
	// only. Consumers should treat it as a strong-ref hint and fall back to
	// the post's own cid when missing.
	cid?: string;
	author: { did: string; handle: string };
}

export interface AtmosphereRepostReason {
	type: 'repost';
	by: { did: string; handle: string; display_name: string };
}

export interface AtmosphereCounts {
	replies: number;
	reposts: number;
	likes: number;
	quotes: number;
}

export interface AtmosphereImage {
	thumb: string;
	fullsize: string;
	alt: string;
	aspect_ratio: { width: number; height: number } | null;
}

export interface AtmosphereEmbedImages {
	type: 'images';
	images: AtmosphereImage[];
}

export interface AtmosphereEmbedVideo {
	type: 'video';
	playlist: string;
	thumbnail: string;
	alt: string;
	aspect_ratio: { width: number; height: number } | null;
}

export interface AtmosphereEmbedExternal {
	type: 'external';
	uri: string;
	title: string;
	description: string;
	thumb: string | null;
}

export interface AtmosphereActorRef {
	did: string;
}

export interface AtmosphereQuoteNotFoundTombstone {
	type: 'not_found';
	uri: string;
}

export interface AtmosphereQuoteBlockedTombstone {
	type: 'blocked';
	uri: string;
	author: AtmosphereActorRef;
}

export type AtmosphereQuoteTombstone =
	| AtmosphereQuoteNotFoundTombstone
	| AtmosphereQuoteBlockedTombstone;

export interface AtmosphereEmbedQuote {
	type: 'quote';
	post: AtmosphereFeedItem | AtmosphereQuoteTombstone;
}

export interface AtmosphereEmbedQuoteWithMedia {
	type: 'quote_with_media';
	post: AtmosphereFeedItem | AtmosphereQuoteTombstone;
	media: AtmosphereEmbedImages | AtmosphereEmbedVideo | null;
}

export type AtmosphereEmbed =
	| AtmosphereEmbedImages
	| AtmosphereEmbedVideo
	| AtmosphereEmbedExternal
	| AtmosphereEmbedQuote
	| AtmosphereEmbedQuoteWithMedia;

export interface AtmosphereFeedItemViewer {
	like: string | null;
	repost: string | null;
}

export interface AtmosphereFeedItem {
	uri: string;
	cid: string;
	author: AtmosphereAuthor;
	created_at: string;
	indexed_at: string;
	text: string;
	html: string;
	lang: string[];
	reply_parent: AtmosphereReplyRef | null;
	reply_root: AtmosphereReplyRef | null;
	reason: AtmosphereRepostReason | null;
	embed: AtmosphereEmbed | null;
	counts: AtmosphereCounts;
	viewer?: AtmosphereFeedItemViewer;
	bluesky_url: string;
}

export interface AtmosphereTimelinePage {
	items: AtmosphereFeedItem[];
	cursor: string | null;
}

export interface AtmosphereThreadPostNode {
	type: 'post';
	post: AtmosphereFeedItem;
	parent: AtmosphereThreadNode | null;
	replies: AtmosphereThreadNode[];
}

export interface AtmosphereThreadNotFoundNode {
	type: 'not_found';
	uri: string;
}

export interface AtmosphereThreadBlockedNode {
	type: 'blocked';
	uri: string;
	author: AtmosphereActorRef;
}

export type AtmosphereThreadNode =
	| AtmosphereThreadPostNode
	| AtmosphereThreadNotFoundNode
	| AtmosphereThreadBlockedNode;

export interface AtmosphereThreadResponse {
	thread: AtmosphereThreadNode;
}

/**
 * Author profile response from /wpcom/v2/reader/atmosphere/profile/{actor}.
 * Connection-agnostic. `description_html` is the server-rendered, sanitised
 * bio with mention/URL/hashtag facets turned into anchors (mirrors what the
 * official Bluesky clients render); `description` is the plain-text fallback.
 * `bluesky_url` is the canonical bsky.app profile URL — already-encoded
 * server-side, so consumers can use it as-is.
 */
export interface AtmosphereAuthorProfile {
	did: string;
	handle: string;
	display_name: string | null;
	description: string;
	description_html: string;
	avatar: string | null;
	banner: string | null;
	bluesky_url: string;
	counts: AtmosphereProfileCounts;
}

/**
 * Author feed page response. Same shape as AtmosphereTimelinePage —
 * factored as a separate type so we can diverge in slice 8+ if the
 * filter-tabs follow-up (CM-628) introduces a filter-aware shape.
 */
export interface AtmosphereAuthorFeedPage {
	items: AtmosphereFeedItem[];
	cursor: string | null;
}

/**
 * Author feed filter values accepted by the backend, mirroring the four
 * ATproto `app.bsky.feed.getAuthorFeed` `filter` enum values. The first
 * three are surfaced as UI tabs (Posts / Replies / Media); the fourth is
 * type-system supported but not exposed in this slice.
 */
export type AtmosphereAuthorFeedFilter =
	| 'posts_no_replies'
	| 'posts_with_replies'
	| 'posts_with_media'
	| 'posts_and_author_threads';

/**
 * Discriminated union encoding the "is the caller following the target?"
 * relationship. Both members of the pair are populated together (the
 * server extracts `following_rkey` from `following` so the frontend
 * doesn't slice AT-URIs). Modeling them as a union enforces the coupling
 * at the type level — readers that need the rkey only see a non-null
 * value once they've narrowed `following` to a string.
 */
export type AtmosphereProfileFollowState =
	| { following: null; following_rkey: null }
	| { following: string; following_rkey: string };

/**
 * Caller-relative relationship state surfaced on the authed
 * /connections/{id}/profile/{actor} endpoint. Derived from the
 * upstream `viewer` subtree on `app.bsky.actor.getProfile`, but
 * deliberately narrower than upstream:
 *
 * - `following` / `following_rkey` are the AT-URI / rkey of the
 *   caller→target follow record (or both null when the caller is
 *   not following). See `AtmosphereProfileFollowState`.
 * - `followed_by` is `true` when upstream populates
 *   `viewer.followedBy` (an AT-URI of the target→caller follow);
 *   collapsed to a boolean here because the UI only needs the
 *   "do they follow me back?" signal, never the inbound rkey.
 */
export type AtmosphereProfileViewer = AtmosphereProfileFollowState & {
	followed_by: boolean;
};

/**
 * Authed companion to `AtmosphereAuthorProfile`, populating the
 * caller-relative `viewer` subtree from `app.bsky.actor.getProfile`.
 */
export interface AtmosphereScopedProfile extends AtmosphereAuthorProfile {
	viewer: AtmosphereProfileViewer;
}

/**
 * Slim profile shape returned by `getFollowers` / `getFollows`.
 * Bluesky's `app.bsky.actor.defs#profileView` lacks the count and
 * banner fields included in `ProfileViewDetailed`, so this is a
 * subset of `AtmosphereAuthorProfile`.
 */
export interface AtmosphereProfileSummary {
	did: string;
	handle: string;
	display_name: string | null;
	description: string;
	avatar: string | null;
}

export interface AtmosphereScopedProfileSummary extends AtmosphereProfileSummary {
	viewer: AtmosphereProfileViewer;
}

export interface AtmosphereScopedProfilesPage {
	items: AtmosphereScopedProfileSummary[];
	cursor: string | null;
}

/**
 * A single follow record returned by the create-follow endpoint.
 * The rkey is parsed server-side from `uri` so callers can issue
 * the matching DELETE without splitting the AT-URI themselves.
 */
export interface AtmosphereFollowRecord {
	uri: string;
	cid: string;
	rkey: string;
}

export interface AtmosphereCreateFollowResponse {
	follow: AtmosphereFollowRecord;
}

export interface CreateLikeParams {
	connectionId: number;
	postUri: string;
	postCid: string;
}

export interface CreateLikeResult {
	uri: string;
	cid: string;
	rkey: string;
}

export interface DeleteLikeParams {
	connectionId: number;
	rkey: string;
}

export interface CreateRepostParams {
	connectionId: number;
	postUri: string;
	postCid: string;
}

export interface CreateRepostResult {
	uri: string;
	cid: string;
	rkey: string;
}

export interface DeleteRepostParams {
	connectionId: number;
	rkey: string;
}

// Metadata embedded in the tag-feed response. The backend always emits
// the `tag` block; `count` is `null` when the AppView's `hitsTotal` is
// absent (it is documented as approximate). `url` is currently always
// present, kept optional so a future backend that omits it for an
// invalid hashtag does not break the type.
export interface AtmosphereTagInfo {
	name: string;
	// Approximate post count from the AppView's `hitsTotal`. Null when
	// the AppView omits the field; consumers should hide the count line
	// rather than render a placeholder.
	count: number | null;
	// Canonical bsky.app hashtag URL (e.g. `https://bsky.app/hashtag/rust`).
	// Built server-side as `https://bsky.app/hashtag/<encoded>`, but
	// consumers should re-validate the protocol before rendering as
	// defence-in-depth against a future backend regression.
	url?: string;
}

export interface AtmosphereTagFeedPage {
	items: AtmosphereFeedItem[];
	cursor: string | null;
	tag?: AtmosphereTagInfo;
}

export interface AtUriRef {
	uri: string;
	cid: string;
}

export interface AtmosphereBlobRef {
	$type: 'blob';
	ref: { $link: string };
	mimeType: string;
	size: number;
}

export interface AtmosphereImageEmbed {
	blob: AtmosphereBlobRef;
	alt: string;
	aspectRatio?: { width: number; height: number };
}

export interface UploadBlobParams {
	connectionId: number;
	file: Blob;
}

export interface UploadBlobResult {
	blob: AtmosphereBlobRef;
}

export interface CreatePostParams {
	connectionId: number;
	text: string;
	reply?: { root: AtUriRef; parent: AtUriRef };
	quote?: AtUriRef;
	media?: { images: AtmosphereImageEmbed[] };
}

export interface CreatePostResult {
	uri: string;
	cid: string;
	rkey: string;
}

export interface DeletePostParams {
	connectionId: number;
	rkey: string;
}

/**
 * Normalized cross-protocol notification kind. `'other'` is the forward-compat
 * bucket for upstream types we don't yet render with bespoke templates (e.g.
 * starterpack-joined, verified, subscribed-post). The frontend falls through to
 * a generic renderer that uses `protocol_type` for the label.
 */
export type AtmosphereNotificationCanonicalType =
	| 'like'
	| 'repost'
	| 'follow'
	| 'mention'
	| 'reply'
	| 'quote'
	| 'other';

export interface AtmosphereNotificationActor {
	handle: string;
	display_name: string | null;
	avatar_url: string | null;
	profile_uri: string;
}

export interface AtmosphereNotificationTarget {
	kind: 'post' | 'profile';
	uri: string;
	excerpt: string;
}

/**
 * Envelope shape returned by
 * `/wpcom/v2/reader/atmosphere/connections/:id/notifications`.
 * `protocol_type` is the raw upstream string (verbatim, lossless);
 * `canonical_type` is the normalized enum. There is no `raw` passthrough —
 * `protocol_type` is the long-tail escape hatch for upstream kinds we don't
 * yet render with bespoke templates. `created_at` is nullable: the backend
 * returns `null` when `indexedAt` is missing or unparseable. `is_read` is
 * server-computed against the user's `seenAt` watermark.
 */
export interface AtmosphereNotification {
	id: string;
	/** Raw upstream type string, e.g. ATProto `reason`. */
	protocol_type: string;
	canonical_type: AtmosphereNotificationCanonicalType;
	actor: AtmosphereNotificationActor;
	target: AtmosphereNotificationTarget | null;
	target_url: string;
	created_at: string | null;
	is_read: boolean;
}

/**
 * Single page from the cursor-paginated notifications endpoint.
 * `next_cursor: null` means end-of-list. `seen_at` is the server's watermark
 * timestamp, exposed at the page level (not per-item) so subsequent "Load more"
 * pages can classify items without re-fetching.
 */
export interface AtmosphereNotificationsPage {
	items: AtmosphereNotification[];
	next_cursor: string | null;
	seen_at: string | null;
}
