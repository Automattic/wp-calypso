import { wpcom } from '../wpcom-fetcher';
import type {
	ReferralApiResponse,
	ReferralCommissionPayout,
	ReferralEmailPreview,
	ReferralEmailPreviewParams,
} from './types';

export async function fetchReferrals( agencyId: number ): Promise< ReferralApiResponse[] > {
	return wpcom.req.get( {
		path: `/agency/${ agencyId }/referrals`,
		apiNamespace: 'wpcom/v2',
	} );
}

export async function fetchReferralCommissionPayout(
	agencyId: number
): Promise< ReferralCommissionPayout > {
	return wpcom.req.get( {
		path: `/agency/${ agencyId }/referrals/commission-payout`,
		apiNamespace: 'wpcom/v2',
	} );
}

/** A POST, but a read: the rendered email for the preview modal. */
export async function fetchReferralEmailPreview(
	agencyId: number,
	params: ReferralEmailPreviewParams
): Promise< ReferralEmailPreview > {
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/referral-email-preview`,
		body: params,
	} );
}
