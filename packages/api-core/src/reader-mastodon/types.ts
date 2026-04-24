export interface MastodonConnection {
	id: number;
	handle: string;
	instance: string;
	display_name: string | null;
	// The list endpoint always returns null. Real avatars come from
	// getConnection(id).
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
	toots: number;
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
