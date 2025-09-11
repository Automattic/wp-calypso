import { wpcom } from '../wpcom-fetcher';

export type MonitorUrlOptions = {
	status_down_webhook_url?: string;
};

export type MonitorUrl = {
	monitor_url: string;
	check_interval: number;
	options?: MonitorUrlOptions;
};

export type MonitorSettings = {
	monitor_active?: boolean;
	wp_note_notifications?: boolean;
	email_notifications?: boolean;
	sms_notifications?: boolean;
	jetmon_defer_status_down_minutes?: number;
	urls?: MonitorUrl[];
};

export type MonitorSettingsCreateResponse = {
	success: boolean;
	settings: MonitorSettings;
};

export async function createJetpackMonitorSettings(
	siteId: number,
	body: Partial< MonitorSettings >
): Promise< MonitorSettingsCreateResponse > {
	return await wpcom.req.post( {
		path: `/sites/${ siteId }/jetpack-monitor-settings`,
		apiNamespace: 'wpcom/v2',
		body,
	} );
}
