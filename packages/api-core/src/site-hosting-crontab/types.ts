export interface Crontab extends CrontabFormData {
	cron_id: number;
	requested_schedule: string;
}

export interface CrontabFormData {
	schedule: string; // this item we should send to backend, and backend return the value inside requested_schedule field. The "schedule" will contain raw cron schedule, e.g. "45 10 * * *"
	command: string;
}
