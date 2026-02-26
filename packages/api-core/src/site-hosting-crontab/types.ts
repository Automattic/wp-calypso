export interface Crontab extends CrontabFormData {
	cron_id: number;
}

export interface CrontabFormData {
	schedule: string;
	command: string;
}
