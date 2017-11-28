/** @format */

/**
 * Internal dependencies
 */

import { AFFILIATE_REFERRAL } from 'state/action-types';

export function affiliateReferral( { affiliateId, urlPath } ) {
	return { type: AFFILIATE_REFERRAL, affiliateId, urlPath };
}
