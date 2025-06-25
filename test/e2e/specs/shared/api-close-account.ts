import { RestAPIClient } from '@automattic/calypso-e2e';
import type { AccountDetails, AccountClosureResponse } from '@automattic/calypso-e2e';

/**
 * Makes an API request to close the user account.
 *
 * Note that closing an user account will also close any existing sites
 * belonging to the user, thus it is not required to close sites if this
 * function is called first.
 *
 * @param {RestAPIClient} client Client to interact with the WP REST API.
 * @param {AccountDetails} accountDetails Details of the account to close.
 * @returns { AccountClosureResponse} Response denoting whether deletion was successful.
 */
export async function apiCloseAccount(
	client: RestAPIClient,
	accountDetails: AccountDetails
): Promise< void > {
	console.log( `Closing account ${ accountDetails.userID }.` );
	const response: AccountClosureResponse = await client.closeAccount( accountDetails );

	if ( response.success !== true ) {
		console.warn( `Failed to delete user ID ${ accountDetails.userID }` );
		console.warn( response );
	} else {
		console.log( `Successfully deleted user ID ${ accountDetails.userID }` );
	}
}
