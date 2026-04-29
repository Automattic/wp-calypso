export interface SocialAuthor {
	id: string;
	handle: string;
	display_name: string;
	avatar: string | null;
	profile_url: string;
}

export interface SocialReplyRef {
	uri: string;
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

export interface SocialEmbedExternal {
	type: 'external';
	uri: string;
	title: string;
	description: string;
	thumb: string | null;
}

// Sources differ on what metadata travels with a tombstone — atmosphere's
// AtmosphereQuoteBlockedTombstone carries an `author` ActorRef, the older
// wire shape included a redundant `reason` lower-case mirror of `type`,
// and Mastodon today carries neither. Both are optional so per-protocol
// mappers preserve what they have without forcing every consumer to handle
// every shape.
export interface SocialQuoteTombstone {
	type: 'not_found' | 'blocked';
	uri: string;
	reason?: 'notfound' | 'blocked';
	author?: { did?: string; id?: string; handle?: string };
}

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
	// sensitive but no specific reason given" — the post-card body
	// still hides content behind a generic "Sensitive content" gate.
	spoiler_text: string;
	sensitive: boolean;
}

export interface SocialPost {
	uri: string;
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
	// Optional content warning — undefined for protocols that don't
	// expose them (atmosphere) or for posts that aren't flagged.
	content_warning?: SocialContentWarning;
}

// Narrow error type covering only the kinds FeedListEmpty switches on.
// Both AtmosphereError and MastodonError emit these kinds (others fall to
// the 'unknown' bucket via per-protocol mappers in the panel layer).
export type SocialError =
	| { kind: 'auth_required' }
	| { kind: 'not_found' }
	| { kind: 'rate_limited'; retry_after?: number }
	| { kind: 'upstream_unavailable' }
	| { kind: 'unknown'; cause?: unknown };
