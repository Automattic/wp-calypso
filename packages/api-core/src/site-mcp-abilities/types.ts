export interface SiteMcpAbilitiesUpdateRequest {
	site_level_enabled?: boolean;
	abilities?: Record< string, boolean >;
}

export interface SiteMcpAbility {
	name: string;
	title: string;
	description: string;
	category: string;
	type: string;
	readonly: boolean;
	site_context: boolean;
	enabled: boolean;
}

export interface SiteMcpAbilitiesResponse {
	has_mcp_plan: boolean;
	site_level_enabled: boolean;
	abilities: SiteMcpAbility[];
	user_overrides: {
		site_level_enabled?: boolean;
		abilities: Record< string, boolean >;
	};
}
