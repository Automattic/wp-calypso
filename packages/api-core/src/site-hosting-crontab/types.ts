export interface Crontab {
	cron_id: number;
	schedule: string;
	command: string;
}

export interface CreateCrontabParams {
	schedule: string;
	command: string;
}
