export interface AtmosphereConnection {
	id: number;
	handle: string;
	did: string;
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

export interface AtmosphereVerifyResult {
	did: string;
	handle: string;
	display_name: string;
	description: string;
	avatar: string | null;
	banner: string | null;
	counts: AtmosphereProfileCounts;
	raw: unknown;
}
