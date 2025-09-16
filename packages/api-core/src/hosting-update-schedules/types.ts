import type { SiteUpdateSchedulesResponse } from '../site-update-schedules/types';

/**
 * Hosting (Mutli-site) Update Schedules types
 *
 * These mirror the shapes used by the legacy client data layer so we can
 * port behavior without regressions while adopting api-core/api-queries.
 */

export type HostingUpdateSchedulesResponse = {
	sites: { [ site_id: string ]: SiteUpdateSchedulesResponse };
};
export type HostingUpdateScheduleStatus =
	| 'in-progress'
	| 'success'
	| 'failure'
	| 'failure-and-rollback'
	| 'failure-and-rollback-fail';
export type HostingUpdateScheduleFrequency = 'daily' | 'weekly';
export type HostingUpdateSchedulePlugin = `${ string }/${ string }.php`;
export interface HostingUpdateSchedule {
	timestamp: number;
	schedule: HostingUpdateScheduleFrequency;
	args: HostingUpdateSchedulePlugin[];
	interval: number;
	last_run_timestamp: number | null;
	last_run_status: HostingUpdateScheduleStatus | null;
	active: boolean;
}

export interface HostingUpdateScheduleSites {
	[ siteId: string ]: {
		[ scheduleId: string ]: HostingUpdateSchedule;
	};
}
