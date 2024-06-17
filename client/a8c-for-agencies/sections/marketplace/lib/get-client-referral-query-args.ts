import { getQueryArg } from '@wordpress/url';

export const getClientReferralQueryArgs = () => {
	const agencyId = getQueryArg( window.location.href, 'agency_id' ) as unknown as number;
	const referralId = getQueryArg( window.location.href, 'referral_id' ) as unknown as number;
	const secret = getQueryArg( window.location.href, 'secret' ) as unknown as string;

	return {
		agencyId,
		referralId,
		secret,
	};
};
