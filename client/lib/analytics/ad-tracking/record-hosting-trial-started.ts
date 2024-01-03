import { redditTrackerFreeTrialStarted } from './reddit';

/**
 * Flow names for free hosting trials. Can be used in third-party trackers to distinguish between different flows,
 * e.g. whether it's an import of an existing site, or a new site.
 */
export enum FlowNames {
	NewSite = 'new_site',
	SiteMigration = 'site_migration',
}

/**
 * Tracks a lead (free trial) in third-party trackers.
 */
export const recordFreeHostingTrialStarted = ( flow_name: FlowNames ) => {
	// Reddit.
	redditTrackerFreeTrialStarted( flow_name );
};
