/**
 * Internal dependencies
 */
import { addQueryArgs } from 'calypso/lib/url';
import wpcom from 'calypso/lib/wp';
import { domainManagementEdit, domainManagementList } from 'calypso/my-sites/domains/paths';

export function getDomainManagementUrl( { slug }, domain ) {
	return domain ? domainManagementEdit( slug, domain ) : domainManagementList( slug );
}

/*
 * Send a POST request to update the ZD ticket linked to the given receiptId.
 *
 * @param receiptId number – Receipt unique identifier.
 */
export async function addOnboardingCallInternalNote( receiptId ) {
	return await wpcom.req.post( {
		path: addQueryArgs(
			{ receipt_id: receiptId },
			'/jetpack-checkout/support-ticket/onboarding-call'
		),
		apiNamespace: 'wpcom/v2',
	} );
}
