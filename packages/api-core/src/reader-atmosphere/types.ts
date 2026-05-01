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
