import { DomainAvailabilityStatus } from '@automattic/api-core';
import type { FilterState } from '../components/search-bar/types';

export const DEFAULT_FILTER: FilterState = {
	exactSldMatchesOnly: false,
	tlds: [],
};

// The registry can't sell these right now, and the shopping cart rejects them
// with a generic "invalid product" error that tells the user nothing. Block the
// add and show the availability notice, which explains the actual reason.
//
// Every status here must produce a notice from getAvailabilityNotice — blocking
// a status it returns null for would leave the button doing nothing at all.
// get-availability-notice's test enforces that.
export const UNAVAILABLE_FOR_PURCHASE_STATUSES: DomainAvailabilityStatus[] = [
	DomainAvailabilityStatus.MAINTENANCE,
	DomainAvailabilityStatus.PURCHASES_DISABLED,
];

export const DOMAIN_BUNDLE_UNAVAILABLE_ERROR_CODE = 'domain_bundle_unavailable';
