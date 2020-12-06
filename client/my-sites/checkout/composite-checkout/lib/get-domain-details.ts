/**
 * External dependencies
 */
import { defaultRegistry } from '@automattic/composite-checkout';
import type { DomainContactDetails } from '@automattic/shopping-cart';

/**
 * Internal dependencies
 */
import { prepareDomainContactDetailsForTransaction } from 'calypso/my-sites/checkout/composite-checkout/types/wpcom-store-state';
import type { ManagedContactDetails } from '../types/wpcom-store-state';

const { select } = defaultRegistry;

export default function getDomainDetails( {
	includeDomainDetails,
	includeGSuiteDetails,
}: {
	includeDomainDetails: boolean;
	includeGSuiteDetails: boolean;
} ): DomainContactDetails | undefined {
	const managedContactDetails: ManagedContactDetails | undefined = select(
		'wpcom'
	)?.getContactInfo();
	if ( ! managedContactDetails ) {
		return undefined;
	}
	const domainDetails = prepareDomainContactDetailsForTransaction( managedContactDetails );
	return includeDomainDetails || includeGSuiteDetails ? domainDetails : undefined;
}
