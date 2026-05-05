export type FediverseActorType = 'user' | 'blog';

export interface FediverseConnection {
	id: number;
	site_host: string;
	handle: string;
	avatar: string;
	actor_url: string;
	blog_id: number;
	actor_type: FediverseActorType;
}

export interface FediverseConnectionsResponse {
	connections: FediverseConnection[];
}

export interface FediverseAuthorizeResponse {
	authorize_url: string;
	state: string;
}

export interface FediverseSiteCapabilities {
	activitypub_active: boolean;
	c2s_enabled: boolean;
	actors: {
		user: { enabled: boolean; can_enable: boolean };
		blog: { enabled: boolean; can_enable: boolean };
	};
	oauth_metadata: {
		authorize_url: string;
		token_url: string;
		registration_url: string;
		revoke_url: string;
	} | null;
	site_host: string;
	site_kind: 'wpcom' | 'jetpack';
	current_user_can_publish: boolean;
}

export interface FediverseEnableResponse {
	success: boolean;
}

export interface FediverseNote {
	id: string;
	url: string;
	posted_at: string;
}
