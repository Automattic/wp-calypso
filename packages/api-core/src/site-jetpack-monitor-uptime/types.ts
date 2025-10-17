export interface SiteUptime {
	status: 'up' | 'down' | 'monitor_inactive';
	downtime_in_minutes?: number;
}
