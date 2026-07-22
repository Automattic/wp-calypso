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
