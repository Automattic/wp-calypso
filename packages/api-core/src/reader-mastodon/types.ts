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
// from the wire and is sanitized again client-side (defence-in-depth).
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
