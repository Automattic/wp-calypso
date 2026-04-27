export interface McpAvailableAbility {
	name: string;
	title: string;
	description: string;
	enabled: boolean;
}

export interface McpSettings {
	enabled: boolean;
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
