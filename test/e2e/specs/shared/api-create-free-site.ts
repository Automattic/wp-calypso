import { RestAPIClient } from '@automattic/calypso-e2e';
import { apiWaitForBearerTokenAcceptance } from './api-wait-for-account-propagation';
import type {
	NewSiteParams,
	NewSiteResponse,
	NewTestUserDetails,
	NewUserResponse,
} from '@automattic/calypso-e2e';

type FreeSiteParams = Partial< Pick< NewSiteParams, 'find_available_url' | 'public' | 'options' > >;

/**
 * Creates the free site needed as setup by domain flows.
 */
export async function apiCreateFreeSiteForUser(
	testUser: NewTestUserDetails,
	newUserDetails: NewUserResponse,
	siteName: string,
	siteParams: FreeSiteParams = {}
): Promise< NewSiteResponse > {
	const restAPIClient = new RestAPIClient(
		{
			username: testUser.username,
			password: testUser.password,
		},
		newUserDetails.body.bearer_token
	);

	await apiWaitForBearerTokenAcceptance( restAPIClient, testUser.email );

	return restAPIClient.createSite( {
		name: siteName,
		title: siteName,
		find_available_url: true,
		...siteParams,
	} );
}

/**
 * Creates the unlaunched free site needed as setup by launch flows.
 */
export async function apiCreateUnlaunchedFreeSiteForUser(
	testUser: NewTestUserDetails,
	newUserDetails: NewUserResponse,
	siteName: string
): Promise< NewSiteResponse > {
	return apiCreateFreeSiteForUser( testUser, newUserDetails, siteName, {
		public: 0,
		options: {
			site_creation_flow: 'onboarding',
			wpcom_public_coming_soon: 1,
		},
	} );
}
