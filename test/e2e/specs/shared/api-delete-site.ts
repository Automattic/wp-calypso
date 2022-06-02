import { RestAPIClient } from '@automattic/calypso-e2e';
import type { SiteDetails } from '@automattic/calypso-e2e';

export async function apiDeleteSite( client: RestAPIClient, siteDetails: SiteDetails ) {
	const response = await client.deleteSite( siteDetails );

	// If the response is `null` then no action has been
	// performed.
	if ( response ) {
		// The only correct response is the string "deleted".
		if ( response.status !== 'deleted' ) {
			console.warn(
				`Failed to delete siteID ${ siteDetails.id }.\nExpected: "deleted", Got: ${ response.status }`
			);
		} else {
			console.log( `Successfully deleted siteID ${ siteDetails.id }.` );
		}
	} else {
		console.log(
			`Failed to delete site ID ${ siteDetails.id }; API call returned a null response.`
		);
	}
}
