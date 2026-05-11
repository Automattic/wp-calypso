/**
 * Wire types for the Reader Fediverse protocol surface.
 *
 * Naming: user-facing labels say "Fediverse"; wpcom-side REST routes
 * live under `/wpcom/v2/reader/fediverse/*`. Module/type names use the
 * user-facing "Fediverse" so the codebase reads as the surface users
 * see.
 *
 * Connection identity is the **Keyring token id** (`id`), not the
 * blog id — every downstream call (post, profile, timeline, ...)
 * routes through that token. `blog_id` is informational (links into
 * Calypso's site dashboards, etc.).
 *
 * Mirrors the `reader-mastodon` / `reader-atmosphere` `ReaderConnection_*`
 * shape so per-protocol shells can plug into the same shared social/*
 * primitives.
 */

/**
 * A connected Fediverse account — a wpcom blog the caller owns with the
 * ActivityPub plugin enabled and a server-side Keyring token minted on
 * first load (no user-driven OAuth flow). Returned by the connections
 * list endpoint, and by the per-id endpoint with the same shape (the
 * backend currently has no "details" projection).
 *
 * Fields mirror the wire shape verbatim — see CM-684 for the contract.
 */
export interface FediverseConnection {
	/** Keyring token id — canonical connection identifier for downstream calls. */
	id: number;
	/** wpcom blog id behind the connection. Useful for cross-Calypso links. */
	blog_id: number;
	/** Blog URL (also the ActivityPub actor URL for blog actors). */
	url: string;
	/** Blog name (no separate display-name vs handle distinction here). */
	name: string;
	/** Site icon URL. May be empty when the blog has no custom icon set. */
	icon: string;
	/** Webfinger handle, e.g. `@myblog@myblog.wordpress.com`. */
	webfinger: string;
}

export interface FediverseConnectionsResponse {
	connections: FediverseConnection[];
}

/**
 * Profile counts surfaced on the author-profile endpoint. Followers /
 * following come from the AP `followers` / `following` collections;
 * `posts` is the lifetime count of public posts/notes the actor has
 * authored.
 */
export interface FediverseProfileCounts {
	followers: number;
	following: number;
	posts: number;
}

/**
 * A federated actor projected onto a Mastodon-compatible Account block
 * by the backend so the shared `<SocialPostCard>` and friends consume
 * a uniform shape across protocols.
 *
 * `acct` is the bare username for local actors (e.g. `alice`) and the
 * fully-qualified webfinger handle for remote ones (e.g.
 * `alice@remote.example`); the connection's host is needed to render
 * local accounts as `@alice@<host>`.
 */
export interface FediverseTimelineAccount {
	id: string;
	username: string;
	acct: string;
	display_name: string;
	avatar: string | null;
}

/**
 * Marker for an `Announce` activity that re-shares another actor's note.
 * Mirrors `MastodonBoost` so the post-card "boosted by" preface is
 * protocol-agnostic.
 */
export interface FediverseBoost {
	type: 'boost';
	by: FediverseTimelineAccount;
}

export interface FediverseCounts {
	replies: number;
	boosts: number;
	favourites: number;
}

/**
 * Single attachment in the flat `media` array. The `type` discriminator
 * preserves AP attachment kinds; `unknown` is a forward-compat fallback
 * for future kinds (e.g. polls, when modeled as attachments).
 */
export interface FediverseMediaAttachment {
	type: 'image' | 'video' | 'gifv' | 'audio' | 'unknown';
	url: string;
	preview_url: string | null;
	alt: string;
	aspect_ratio: { width: number; height: number } | null;
}

/**
 * Per-viewer interaction state. `favourited` corresponds to the AP
 * `Like` activity; `reblogged` to `Announce`. Optional during the
 * backend rollout window — consumers must treat a missing viewer as
 * "not favourited / not reblogged".
 */
export interface FediverseFeedItemViewer {
	favourited: boolean;
	reblogged: boolean;
}

/**
 * A single status-shaped feed item. Backend projects AP `Note` /
 * `Article` activities into this Mastodon-compatible shape so the
 * frontend can render it through the same shared `<SocialPostCard>`
 * subtree as Mastodon.
 *
 * `id` is the Keyring-scoped identifier the rest of the protocol
 * surface routes through (replies, favourites, etc.). `url` is the
 * canonical permalink on the source site.
 */
export interface FediverseFeedItem {
	id: string;
	url: string;
	created_at: string;
	account: FediverseTimelineAccount;
	content: string;
	spoiler_text: string;
	sensitive: boolean;
	language: string | null;
	in_reply_to_id: string | null;
	in_reply_to_account_id: string | null;
	boost: FediverseBoost | null;
	media: FediverseMediaAttachment[];
	counts: FediverseCounts;
	viewer?: FediverseFeedItemViewer;
}

export interface FediverseTimelinePage {
	items: FediverseFeedItem[];
	cursor: string | null;
}

/**
 * Caller-relative relationship state on the author-profile endpoint.
 * `following` and `followed_by` are reciprocal flags — viewer follows
 * the actor, actor follows viewer. `requested` is true when a follow
 * request is pending (locked accounts).
 */
export interface FediverseAuthorProfileViewer {
	following: boolean;
	followed_by: boolean;
	requested: boolean;
}

/**
 * Wire shape from `GET /reader/fediverse/connections/<id>/profile/<actor>`.
 * Mirrors `MastodonAuthorProfile` so the shared `SocialAuthorProfilePanel`
 * can render the same header band across protocols.
 *
 * `note` is server-sanitised AP `summary` HTML (re-sanitised client-side
 * as defence-in-depth via the same DOMPurify allow-list as Mastodon).
 * `header` is the AP actor `image` (banner). `acct` and `handle` carry
 * the same fully-qualified webfinger value (e.g. `@alice@example.com`)
 * — the leading `@` is included by the backend; the post-card prefixes
 * its own `@` at render time, so the mapper strips the leading `@`
 * before populating `SocialPost.author.handle`.
 *
 * `is_self` is true when the profile being fetched is the connected
 * caller's own actor — useful for distinguishing "your own profile"
 * vs "someone else's profile" without comparing webfinger strings.
 */
export interface FediverseAuthorProfile {
	/** Canonical AP actor URL, e.g. `https://example.com/users/alice`. */
	id: string;
	/** Bare local username, e.g. `alice`. */
	username: string;
	/** Fully-qualified webfinger handle with leading `@`, e.g. `@alice@example.com`. */
	acct: string;
	/** Same value as `acct`. Either is fine to read; the post-card uses `handle`. */
	handle: string;
	/** Host portion of the webfinger handle, e.g. `example.com`. */
	instance: string;
	display_name: string;
	note: string;
	avatar: string | null;
	header: string | null;
	/** Web URL of the actor's profile, e.g. `https://example.com/@alice`. */
	url: string;
	/** True for AP actors that gate their content behind a follow approval. */
	locked: boolean;
	counts: FediverseProfileCounts;
	viewer: FediverseAuthorProfileViewer;
	/** True when this actor is the connected caller's own self. */
	is_self: boolean;
}

/**
 * Wire envelope from the author-profile endpoint. The backend wraps the
 * profile object in a single-key `profile` field so the response can
 * grow side-band fields (lookup metadata, fetch timestamps, etc.)
 * without breaking the shape.
 */
export interface FediverseAuthorProfileResponse {
	profile: FediverseAuthorProfile;
}

/**
 * Author-feed pages share the timeline page shape — alias rather than
 * duplicate so a future field on `FediverseTimelinePage` propagates
 * here too. Mirrors `MastodonAuthorFeedPage`.
 */
export type FediverseAuthorFeedPage = FediverseTimelinePage;

/**
 * Compact account row shape returned by the followers / following list
 * endpoints. Mirrors `MastodonAccountSummary`: a strict subset of the
 * profile-card surface fields plus per-viewer relationship state.
 * `note_text` is the server-side plain-text projection of the actor's
 * AP `summary` so the row can render in compact form without
 * un-rendering HTML on the client. The HTML `note` field exists on the
 * full `FediverseAuthorProfile`; add it back to this row shape when a
 * future surface needs to render bio HTML inline.
 *
 * `handle` is the bare webfinger handle (`user@host`) synthesised
 * server-side from `acct` + connection's home host. Mirrors the
 * Mastodon row convention — the display layer (`SocialAccountRow`)
 * renders the `@` prefix once.
 */
export interface FediverseAccountSummary {
	/** Canonical AP actor URL, e.g. `https://example.com/users/alice`. */
	id: string;
	username: string;
	/** Webfinger handle with leading `@` (matches `FediverseAuthorProfile.acct`). */
	acct: string;
	/** Bare webfinger handle, e.g. `alice@example.com` (no leading `@`). */
	handle: string;
	display_name: string;
	note_text: string;
	avatar: string | null;
	locked: boolean;
	/**
	 * Per-viewer relationship state. Optional during the backend rollout
	 * window and absent for `is_self` rows (the server skips the
	 * relationships call for the caller's own account). Consumers must
	 * treat a missing viewer as "no follow UI available".
	 */
	viewer?: FediverseAuthorProfileViewer;
	/** `true` when this row matches the connection's own actor. */
	is_self: boolean;
}

export interface FediverseAccountSummariesPage {
	items: FediverseAccountSummary[];
	cursor: string | null;
}

export interface FediverseCreateFollowParams {
	connectionId: number;
	/**
	 * Actor identifier — webfinger handle (`user@host` or `@user@host`) or
	 * canonical AP actor URL. The backend resolves to the upstream
	 * activity-pub actor before issuing the Follow activity.
	 */
	actor: string;
}

export interface FediverseDeleteFollowParams {
	connectionId: number;
	/** Same actor identifier accepted by `FediverseCreateFollowParams`. */
	actor: string;
}

/**
 * Response shape returned by both the create-follow and delete-follow
 * endpoints. Mirrors `MastodonFollowResponse` — the wpcom backend
 * projects the upstream AP `Relationship` object into a uniform
 * `viewer` block so optimistic + server-state updates use the same
 * patcher.
 */
export interface FediverseFollowResponse {
	viewer: FediverseAuthorProfileViewer;
}
