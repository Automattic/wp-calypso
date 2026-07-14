import type { RestAPIClient } from '@automattic/calypso-e2e';

const PREFERENCE_KEY = 'hosting-dashboard-opt-in';

interface HostingDashboardOptInPreference {
	value?: string;
}

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
 * The write is verified with a read-back because `RestAPIClient.sendRequest`
 * returns API error responses instead of throwing; without the check a rejected
 * write would surface much later as an unrelated-looking redirect to the
 * dashboard.
 *
 * @param {RestAPIClient} client Client to interact with the WP REST API.
 * @throws If the preference does not persist, with the API responses attached.
 */
export async function apiForceDashboardOptOut( client: RestAPIClient ): Promise< void > {
	const setResponse = await client.setCalypsoPreferences( {
		[ PREFERENCE_KEY ]: {
			value: 'forced-opt-out',
			updated_at: new Date().toISOString(),
		},
	} );

	const readBack = await client.getCalypsoPreferences();
	const saved = readBack?.calypso_preferences?.[ PREFERENCE_KEY ] as
		| HostingDashboardOptInPreference
		| undefined;

	if ( saved?.value !== 'forced-opt-out' ) {
		throw new Error(
			`Failed to persist ${ PREFERENCE_KEY }=forced-opt-out.\n` +
				`POST response: ${ JSON.stringify( setResponse ) }\n` +
				`GET response: ${ JSON.stringify( readBack ) }`
		);
	}
}
