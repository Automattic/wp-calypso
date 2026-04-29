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
	raw: Record< string, unknown >;
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
