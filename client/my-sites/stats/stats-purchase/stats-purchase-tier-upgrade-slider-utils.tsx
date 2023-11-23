// TODO: Some stuff:
// - Move this inline in "stats-purchase-tier-upgrade-slider.tsx" OR
// - Add imports as needed
// - Translate locally?

type StatsPlanTier = {
	id: string;
	description: string;
	price: string;
	views: string;
};

// TODO: Remove hard-coded data once API is working.
// We need to understand the shape of the data first.
// Once we have that, replace this with a sample response object.
const planTiers: StatsPlanTier[] = [
	{
		id: '10k',
		price: '$9',
		views: '10k',
		description: '$9/month for 10k views',
	},
	{
		id: '100k',
		price: '$19',
		views: '100k',
		description: '$19/month for 100k views',
	},
	{
		id: '250k',
		price: '$29',
		views: '250k',
		description: '$29/month for 250k views',
	},
	{
		id: '500k',
		price: '$49',
		views: '500k',
		description: '$49/month for 500k views',
	},
	{
		id: '1M',
		price: '$69',
		views: '1M',
		description: '$69/month for 1M views',
	},
	{
		id: '1M++',
		price: '$69++',
		views: '1M++',
		description: '$25/month per million views if views exceed 1M',
	},
];

function getPlanTiers(): StatsPlanTier[] {
	// TODO: Work out data fetch mechanisim.
	// Should come from the API/Redux.
	// Currently comes from local const above.
	// I'd probably favour React Query so as to avoid local caching.
	return planTiers;
}

function getPlanTiersForSite( plans: StatsPlanTier[] ): StatsPlanTier[] {
	// TODO: Determine if we need to filter plans locally.
	// Accept the fill list of plans and filter out options
	// that don't apply to the current site (ie: only upgrades, not downgrades)
	// Could happen on the server, in which case, we could remove this step.
	return plans;
}

function useAvailableUpgradeTiers(): StatsPlanTier[] {
	// Just a placeholder for now.
	// I'm thinking the data (including translations?) would come from the API
	// so that it can be configured/updated server side.
	// Probably need a site ID as a minimum for API calls.

	// This is purposefully coded like this to call out potential steps to completion.
	// We can inline function calls and clean up as needed.

	// 1. Get the plans.
	let plans = getPlanTiers();

	// 2. Filter based on current plan. (this could also happen on the server)
	plans = getPlanTiersForSite( plans );

	// 3. Return the relevant upgrade options as a list.
	return plans;
}

export default useAvailableUpgradeTiers;
