export interface McpAvailableAbility {
	name: string;
	title: string;
	description: string;
	category: string;
	enabled: boolean;
}

export interface McpAvailableCategory {
	slug: string;
	label: string;
}

export interface McpSettings {
	enabled: boolean;
	available_categories: McpAvailableCategory[];
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
