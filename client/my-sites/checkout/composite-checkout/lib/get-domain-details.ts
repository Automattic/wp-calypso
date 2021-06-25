/**
 * External dependencies
 */
import type { DomainContactDetails } from '@automattic/shopping-cart';
import type { ManagedContactDetails } from '@automattic/wpcom-checkout';

/**
 * Internal dependencies
 */
import { prepareDomainContactDetailsForTransaction } from 'calypso/my-sites/checkout/composite-checkout/types/wpcom-store-state';

export default function getDomainDetails(
	contactDetails: ManagedContactDetails | undefined,
	{
		includeDomainDetails,
		includeGSuiteDetails,
	}: {
		includeDomainDetails: boolean;
		includeGSuiteDetails: boolean;
	}
): DomainContactDetails | undefined {
	if ( ! contactDetails ) {
		return undefined;
	}
	const domainDetails = prepareDomainContactDetailsForTransaction( contactDetails );
	return includeDomainDetails || includeGSuiteDetails ? domainDetails : undefined;
}
