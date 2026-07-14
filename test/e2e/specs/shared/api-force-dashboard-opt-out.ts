import type { RestAPIClient } from '@automattic/calypso-e2e';

/**
 * Pins the user to the classic dashboard by setting the `hosting-dashboard-opt-in`
 * preference to `forced-opt-out`, which wins over percentage-rollout enrollment
 * (see `client/dashboard/utils/hosting-dashboard-enrollment.ts`).
 *
 * New users can land in the hosting dashboard rollout cohort, where classic
 * purchase-management routes redirect to the dashboard billing pages. Specs that
 * drive the classic purchases UI call this after signup so their coverage stays
 * deterministic. Remove once those specs migrate to the dashboard billing UI.
 *
 * @param {RestAPIClient} client Client to interact with the WP REST API.
 */
export async function apiForceDashboardOptOut( client: RestAPIClient ): Promise< void > {
	await client.setCalypsoPreferences( {
		'hosting-dashboard-opt-in': {
			value: 'forced-opt-out',
			updated_at: new Date().toISOString(),
		},
	} );
}
