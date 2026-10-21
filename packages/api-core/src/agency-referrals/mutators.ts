import { wpcom } from '../wpcom-fetcher';
import type { CreateReferralParams, ReferralApiResponse } from './types';

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

export async function createReferral(
	agencyId: number,
	params: CreateReferralParams
): Promise< ReferralApiResponse > {
	return wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: `/agency/${ agencyId }/referrals`,
		body: params,
	} );
}
