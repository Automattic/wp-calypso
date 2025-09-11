/**
 * Scheduled Updates types
 *
 * These mirror the shapes used by the legacy client data layer so we can
 * port behavior without regressions while adopting api-core/api-queries.
 */

export type LastRunStatus =
	| 'in-progress'
	| 'success'
	| 'failure'
	| 'failure-and-rollback'
	| 'failure-and-rollback-fail'
	| null;

export type ScheduleUpdates = {
	id: string;
	hook?: string;
	interval: number;
	timestamp: number; // unix seconds
	schedule: 'weekly' | 'daily';
	args: string[]; // plugin identifiers (e.g. "akismet/akismet.php")
	last_run_status: LastRunStatus;
	last_run_timestamp: number | null;
	health_check_paths?: string[];
	active: boolean;
};

export type MultisiteSchedulesUpdatesResponse = {
	sites: { [ site_id: string ]: { [ scheduleId: string ]: ScheduleUpdates } };
};

export type CreateUpdateScheduleBody = {
	plugins: string[];
	schedule: {
		interval: 'daily' | 'weekly';
		timestamp: number; // unix seconds
		/**
		 * Back-compat field temporarily accepted by the backend.
		 * Keep until server removes the need for it.
		 */
		health_check_paths?: string[];
	};
	/** Duplicate of schedule.health_check_paths kept for back-compat */
	health_check_paths?: string[];
};

export type EditUpdateScheduleBody = CreateUpdateScheduleBody;
