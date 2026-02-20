export interface Crontab extends CrontabFormData {
	cron_id: number;
	requested_schedule: string;
}

export interface CrontabFormData {
	schedule: string;
	command: string; // this item we should send to backend, and backend return the value inside requested_schedule field. command will have raw cron schedule, e.g. "45 10 * * *"
}
