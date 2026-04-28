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

export interface MastodonTimelineAuthor {
	id: string;
	acct: string;
	display_name: string;
	avatar: string | null;
	url: string;
}

export interface MastodonReplyRef {
	uri: string;
	author: { acct: string };
}

export interface MastodonBoostReason {
	type: 'boost';
	by: { acct: string; display_name: string; avatar: string | null };
}

export interface MastodonCounts {
	replies: number;
	reblogs: number;
	favourites: number;
	quotes?: number;
}

export interface MastodonImage {
	thumb: string;
	fullsize: string;
	alt: string;
	aspect_ratio: { width: number; height: number } | null;
}

export interface MastodonEmbedImages {
	type: 'images';
	images: MastodonImage[];
}

export interface MastodonEmbedVideo {
	type: 'video';
	playlist: string;
	thumbnail: string;
	alt: string;
	aspect_ratio: { width: number; height: number } | null;
}

export interface MastodonEmbedGifv {
	type: 'gifv';
	src: string;
	thumbnail: string;
	alt: string;
	aspect_ratio: { width: number; height: number } | null;
}

export interface MastodonEmbedAudio {
	type: 'audio';
	src: string;
	alt: string;
	duration_seconds: number | null;
}

export interface MastodonEmbedExternal {
	type: 'external';
	uri: string;
	title: string;
	description: string;
	thumb: string | null;
}

export interface MastodonQuoteTombstone {
	type: 'not_found' | 'blocked';
	uri: string;
	reason: 'notfound' | 'blocked';
}

export interface MastodonEmbedQuote {
	type: 'quote';
	post: MastodonFeedItem | MastodonQuoteTombstone;
}

export interface MastodonEmbedQuoteWithMedia {
	type: 'quote_with_media';
	post: MastodonFeedItem | MastodonQuoteTombstone;
	media: MastodonEmbedImages | MastodonEmbedVideo | null;
}

export type MastodonEmbed =
	| MastodonEmbedImages
	| MastodonEmbedVideo
	| MastodonEmbedGifv
	| MastodonEmbedAudio
	| MastodonEmbedExternal
	| MastodonEmbedQuote
	| MastodonEmbedQuoteWithMedia;

export interface MastodonFeedItem {
	uri: string;
	id: string;
	author: MastodonTimelineAuthor;
	created_at: string;
	edited_at: string | null;
	text: string;
	html: string;
	lang: string | null;
	reply_parent: MastodonReplyRef | null;
	reply_root: MastodonReplyRef | null;
	reason: MastodonBoostReason | null;
	counts: MastodonCounts;
	embed: MastodonEmbed | null;
}

export interface MastodonTimelinePage {
	items: MastodonFeedItem[];
	cursor: string | null;
}
