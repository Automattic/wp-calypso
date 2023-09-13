import { prepareDomainContactDetailsForTransaction } from 'calypso/my-sites/checkout/src/types/wpcom-store-state';
import type { DomainContactDetails } from '@automattic/shopping-cart';
import type { ManagedContactDetails } from '@automattic/wpcom-checkout';

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
