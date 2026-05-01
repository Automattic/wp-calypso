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
 * Caller-relative relationship state surfaced on the authed
 * /connections/{id}/profile/{actor} endpoint. Mirrors the upstream
 * `viewer.following` / `viewer.followedBy` fields, but the rkey is
 * parsed server-side from the AT-URI so the frontend doesn't have
 * to slice URIs.
 *
 * - `following`: AT-URI of the caller→target follow record, or null.
 * - `following_rkey`: rkey extracted from `following`, or null.
 * - `followed_by`: true when the target's profile carries a follow
 *   record pointing at the caller's DID.
 */
export interface AtmosphereProfileViewer {
	following: string | null;
	following_rkey: string | null;
	followed_by: boolean;
}

/**
 * Authed companion to AtmosphereAuthorProfile. Returned by
 * GET /reader/atmosphere/connections/{id}/profile/{actor}, which
 * runs an authed app.bsky.actor.getProfile so the upstream `viewer`
 * subtree is populated. Used by the Follow / Follow back / Following
 * button on the Bluesky author profile page.
 */
export interface AtmosphereScopedProfile extends AtmosphereAuthorProfile {
	viewer: AtmosphereProfileViewer;
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

/**
 * Response shape for POST /reader/atmosphere/connections/{id}/follows.
 */
export interface AtmosphereCreateFollowResponse {
	follow: AtmosphereFollowRecord;
}
