import { redditTrackerFreeTrialStarted } from './reddit';

/**
 * Tracks a lead (free trial) in third-party trackers.
 */
export const recordFreeHostingTrialStarted = ( flow_name: string ) => {
	// Reddit.
	redditTrackerFreeTrialStarted( flow_name );
};
