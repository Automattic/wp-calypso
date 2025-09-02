export interface DefensiveModeSettings {
	enabled: boolean;
	enabled_by_a11n: boolean;
	enabled_until: number;
}

export interface DefensiveModeSettingsUpdate {
	active: boolean;
	ttl?: number;
}
