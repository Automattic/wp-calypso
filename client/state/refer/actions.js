/** @format */

/**
 * Internal dependencies
 */
import { AFFILIATE_REFERRAL } from 'state/action-types';
import 'state/data-layer/third-party/refer';

export function affiliateReferral( { affiliateId, campaignId, urlPath } ) {
	return { type: AFFILIATE_REFERRAL, affiliateId, campaignId, urlPath };
}
