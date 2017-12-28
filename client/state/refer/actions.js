/** @format */

/**
 * Internal dependencies
 */

import { AFFILIATE_REFERRAL } from 'client/state/action-types';

export function affiliateReferral( { affiliateId, urlPath } ) {
	return { type: AFFILIATE_REFERRAL, affiliateId, urlPath };
}
