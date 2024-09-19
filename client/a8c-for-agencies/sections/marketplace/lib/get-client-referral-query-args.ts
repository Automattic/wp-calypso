import { getQueryArg } from '@wordpress/url';

export const getClientReferralQueryArgs = () => {
	const agencyId = getQueryArg( window.location.href, 'agency_id' ) as unknown as number;
	const referralId = getQueryArg( window.location.href, 'referral_id' ) as unknown as number;
	const secret = getQueryArg( window.location.href, 'secret' ) as unknown as string;
	const paymentMethodAdded = getQueryArg(
		window.location.href,
		'payment_method_added'
	) as unknown as boolean;

	return {
		agencyId,
		referralId,
		secret,
		paymentMethodAdded,
	};
};
