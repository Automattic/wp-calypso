/** @format */

/**
 * Internal dependencies
 */
import { AFFILIATE_REFERRAL } from 'state/action-types';
import 'state/data-layer/third-party/refer';

export function affiliateReferral( { affiliateId, campaignId, subId, urlPath } ) {
	return { type: AFFILIATE_REFERRAL, affiliateId, campaignId, subId, urlPath };
}
