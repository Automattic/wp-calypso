export interface AtmosphereConnection {
	id: number;
	did: string;
	handle: string;
	display_name: string | null;
	// The list endpoint always returns null. Real avatars come from
	// getConnection(id).
	avatar: string | null;
	// Number of Jetpack Social sites that share to this Bluesky handle.
	// Surfaced so the disconnect UI can warn when the value is > 0.
	publicize_site_count: number;
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
