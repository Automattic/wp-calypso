import { areNextAndCurrentPayoutDatesEqual } from '../../referrals/lib/get-next-payout-date';
import { WooPaymentsData } from '../types';

interface WooPaymentsSiteData {
	transactions: number | null;
	payout: number | null;
	estimatedPayout: number | null;
}

export const getSiteData = (
	woopaymentsData: WooPaymentsData,
	siteId: number
): WooPaymentsSiteData => {
	const siteData = woopaymentsData?.data?.total?.sites?.[ siteId ];
	const sitePayout = siteData?.payout ?? 0;
	const siteTransactions = siteData?.transactions ?? 0;

	// Get estimated payout from current quarter
	const currentQuarterEstimate =
		woopaymentsData?.data?.estimated?.current_quarter?.sites?.[ siteId ]?.payout ?? 0;

	// Get estimated payout from previous quarter
	const previousQuarterEstimate =
		woopaymentsData?.data?.estimated?.previous_quarter?.sites?.[ siteId ]?.payout ?? 0;

	// If next and current payout dates are not equal, add previous quarter estimate
	const now = new Date();
	const estimatedPayout = areNextAndCurrentPayoutDatesEqual( now )
		? currentQuarterEstimate
		: currentQuarterEstimate + previousQuarterEstimate;

	return {
		transactions: siteTransactions,
		payout: sitePayout,
		estimatedPayout,
	};
};
