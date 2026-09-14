export interface SocialAuthor {
	id: string;
	handle: string;
	display_name: string;
	avatar: string | null;
	profile_url: string;
}

export interface SocialReplyRef {
	uri: string;
	// Strong-ref CID for the referenced record. Optional because not every
	// protocol exposes one (Mastodon has no native CIDs) and the atmosphere
	// backend may omit it during the rollout window for `reply_root` /
	// `reply_parent`. Reply-to-reply submission paths fall back to the
	// surrounding post's `cid` when this is missing.
	cid?: string;
	author: { id?: string; handle: string };
}

export interface SocialReason {
	type: 'repost';
	by: { id?: string; handle: string; display_name: string };
}

export interface SocialCounts {
	replies: number;
	reposts: number;
	likes: number;
	quotes: number;
}

export interface SocialImage {
	thumb: string;
	fullsize: string;
	alt: string;
	aspect_ratio: { width: number; height: number } | null;
}

export interface SocialEmbedImages {
	type: 'images';
	images: SocialImage[];
}

export interface SocialEmbedVideo {
	type: 'video';
	playlist: string;
	thumbnail: string;
	alt: string;
	aspect_ratio: { width: number; height: number } | null;
}

export interface SocialEmbedGifv {
	type: 'gifv';
	src: string;
	thumbnail: string;
	alt: string;
	aspect_ratio: { width: number; height: number } | null;
}

export interface SocialEmbedAudio {
	type: 'audio';
	src: string;
	alt: string;
	duration_seconds: number | null;
}

export interface SocialLongFormDocument {
	title: string;
	description: string;
	/** Site-relative path; expected to start with `/`. */
	path: string;
	/** ISO-8601 timestamp, or empty string when unknown. */
	published_at: string;
	/** Cover-image URL (Bluesky CDN), or null when the post carries none. */
	cover_image: string | null;
	/** Reading time in minutes (AppView-computed), or null when unavailable. */
	reading_time: number | null;
}

export interface SocialLongFormPublication {
	name: string;
	display_name: string;
	description: string;
	url: string;
	/** Publisher's protocol handle (e.g. `jeremy.herve.bzh`). Empty when unresolved. */
	handle: string;
	/** Avatar URL (Bluesky CDN), or null when absent. */
	avatar: string | null;
}

export interface SocialLongForm {
	document: SocialLongFormDocument;
	publication: SocialLongFormPublication;
}

export interface SocialEmbedExternal {
	type: 'external';
	uri: string;
	title: string;
	description: string;
	thumb: string | null;
	/** Present when the link resolves to a verified long-form record. */
	long_form?: SocialLongForm;
}

// Sources differ on what metadata travels with a tombstone — atmosphere's
// AtmosphereQuoteBlockedTombstone carries an `author` ActorRef (with `did`),
// the older wire shape included a redundant `reason` lower-case mirror of
// `type`, and Mastodon today carries neither. Optional fields preserve
// protocol-specific data without forcing consumers to handle every shape.
export interface SocialQuoteTombstone {
	type: 'not_found' | 'blocked';
	uri: string;
	reason?: 'notfound' | 'blocked';
	author?: { did?: string; id?: string; handle?: string };
}

export interface SocialThreadPostNode {
	type: 'post';
	post: SocialPost;
	parent: SocialThreadNode | null;
	replies: SocialThreadNode[];
}

// Split into two interfaces (rather than `type: 'not_found' | 'blocked'`)
// so TypeScript can narrow each kind out of the union independently
// when consumers handle them separately.
export interface SocialThreadNotFoundNode {
	type: 'not_found';
	uri: string;
}

export interface SocialThreadBlockedNode {
	type: 'blocked';
	uri: string;
}

export type SocialThreadTombstoneNode = SocialThreadNotFoundNode | SocialThreadBlockedNode;

export type SocialThreadNode =
	| SocialThreadPostNode
	| SocialThreadNotFoundNode
	| SocialThreadBlockedNode;

export interface SocialEmbedQuote {
	type: 'quote';
	post: SocialPost | SocialQuoteTombstone;
}

export interface SocialEmbedQuoteWithMedia {
	type: 'quote_with_media';
	post: SocialPost | SocialQuoteTombstone;
	media: SocialEmbedImages | SocialEmbedVideo | null;
}

export type SocialEmbed =
	| SocialEmbedImages
	| SocialEmbedVideo
	| SocialEmbedGifv
	| SocialEmbedAudio
	| SocialEmbedExternal
	| SocialEmbedQuote
	| SocialEmbedQuoteWithMedia;

export interface SocialContentWarning {
	// Mastodon's content-warning text. Empty string means "marked
	// Mastodon decouples these two fields:
	//   - spoiler_text non-empty -> the whole post is behind a content-warning
	//     gate (text + media hidden until the user clicks "Show content").
	//   - sensitive: true -> media should be blurred but the post still renders.
	// A post can be sensitive without spoiler_text (NSFW media, no CW reason),
	// or have a spoiler_text without being marked sensitive (text-only spoiler).
	spoiler_text: string;
	sensitive: boolean;
}

export interface SocialPost {
	uri: string;
	cid?: string;
	permalink: string;
	text: string;
	html: string;
	created_at: string;
	indexed_at: string | null;
	lang: string[];
	author: SocialAuthor;
	reply_parent: SocialReplyRef | null;
	reply_root: SocialReplyRef | null;
	reason: SocialReason | null;
	embed: SocialEmbed | null;
	counts: SocialCounts;
	viewer?: {
		like: string | null;
		repost: string | null;
	};
	// Optional content warning — undefined for protocols that don't
	// expose them (atmosphere) or for posts that aren't flagged.
	content_warning?: SocialContentWarning;
}

// Narrow error type covering only the kinds FeedListEmpty switches on.
// Both AtmosphereError and MastodonError emit these kinds (others fall to
// the 'unknown' bucket via per-protocol mappers in the panel layer). The
// optional `message` on `unknown` lets per-protocol projectors surface the
// backend's human-readable copy (e.g. `bad_request` validation messages)
// instead of being collapsed to the generic "Something went wrong" line.
export type SocialError =
	| { kind: 'auth_required' }
	| { kind: 'not_found' }
	| { kind: 'rate_limited'; retry_after?: number }
	| { kind: 'upstream_unavailable' }
	| { kind: 'unknown'; cause?: unknown; message?: string };
