/**
 * Update Schedules types
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

export type UpdateSchedule = {
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

export type SiteUpdateSchedulesResponse = Record< string, Omit< UpdateSchedule, 'id' > >;

export type CreateSiteUpdateScheduleBody = {
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

export type EditSiteUpdateScheduleBody = CreateSiteUpdateScheduleBody;
