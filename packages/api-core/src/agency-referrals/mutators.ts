import { wpcom } from '../wpcom-fetcher';

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
