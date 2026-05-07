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
