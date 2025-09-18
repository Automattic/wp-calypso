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
