import { wpcom } from '../wpcom-fetcher';
import type { ReferralApiResponse, ReferralCommissionPayout } from './types';

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

export async function archiveReferral(
	agencyId: number,
	referralId: number
): Promise< { success: boolean } > {
	return wpcom.req.post( {
		path: `/agency/${ agencyId }/referrals/${ referralId }/archive`,
		apiNamespace: 'wpcom/v2',
		method: 'PUT',
	} );
}

export async function resendReferralEmail(
	agencyId: number,
	referralId: number
): Promise< { success: boolean } > {
	return wpcom.req.post( {
		path: `/agency/${ agencyId }/referrals/${ referralId }/resend`,
		apiNamespace: 'wpcom/v2',
		method: 'POST',
	} );
}
