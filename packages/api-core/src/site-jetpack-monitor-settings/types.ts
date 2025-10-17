type MonitorUrlOptions = {
	status_down_webhook_url?: string;
};

type MonitorUrl = {
	monitor_url: string;
	check_interval: number;
	options?: MonitorUrlOptions;
};

export type JetpackMonitorSettings = {
	monitor_active?: boolean;
	wp_note_notifications?: boolean;
	email_notifications?: boolean;
	sms_notifications?: boolean;
	jetmon_defer_status_down_minutes?: number;
	urls?: MonitorUrl[];
};

export type JetpackMonitorSettingsCreateResponse = {
	success: boolean;
	settings: JetpackMonitorSettings;
};
