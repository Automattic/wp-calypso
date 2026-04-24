export interface MastodonConnection {
	id: number;
	// Webfinger-style display handle from the list endpoint, shaped as
	// `@user@instance`. Render as-is — do not re-prefix with `@` or
	// append `@instance`.
	handle: string;
	instance: string;
	display_name: string | null;
	// The list endpoint currently omits the avatar URL; fetch
	// getConnection(id) for the real value.
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
