import { mayWeTrackByTracker } from '../tracker-buckets';

/**
 * We'll be accessing rdt from the window object. These definitions are homemade and not from Reddit (not documented, as the example script is JS),
 * but they make the validation happy.
 */
declare global {
	interface Window {
		rdt: any[] & { ( ...args: any[] ): void };
	}
}

/**
 * Tracks a lead (free trial) in Reddit.
 */
export const redditTrackerFreeTrialStarted = ( trial_flow_name: string ): void => {
	if ( ! mayWeTrackByTracker( 'reddit' ) ) {
		return;
	}

	const params = {
		products: [
			{
				id: 'wpcom_creator_trial',
				name: trial_flow_name,
				category: 'free_trial',
			},
		],
	};
	window.rdt( 'track', 'SignUp', params );
};

/**
 * Tracks a lead (free trial) in third-party trackers. `flow_name` is the name of the flow the user is coming from, e.g.
 * "new-hosted-site", which can be supplied to the third-party trackers to identify different flows (depending on the analytics)
 * provided by the third-party.
 */
export const recordFreeHostingTrialStarted = ( flow_name: string ) => {
	// Reddit.
	redditTrackerFreeTrialStarted( flow_name );
};
