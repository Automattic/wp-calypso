export interface McpAvailableAbility {
	name: string;
	title: string;
	description: string;
	default_enabled: boolean;
	effective_enabled: boolean;
}

export interface McpSettings {
	enabled: boolean;
	abilities: Record< string, boolean >;
	available_abilities: McpAvailableAbility[];
}

export interface McpSettingsUpdate {
	enabled?: boolean;
	abilities?: Record< string, boolean >;
}

export interface McpApiError {
	status: number;
	code: string | null;
	message: string;
}
