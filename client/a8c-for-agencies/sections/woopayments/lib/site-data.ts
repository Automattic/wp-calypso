import { areNextAndCurrentPayoutDatesEqual } from '../../referrals/lib/get-next-payout-date';
import type { WooPaymentsData } from '@automattic/api-core';

interface WooPaymentsSiteData {
	transactions: number | null;
	payout: number | null;
	estimatedPayout: number | null;
}

export const getSiteData = (
	woopaymentsData: WooPaymentsData | undefined,
	siteId: number
): WooPaymentsSiteData => {
	const siteData = woopaymentsData?.data?.total?.sites?.[ siteId ];
	const sitePayout = siteData?.payout ?? 0;
	const totalTransactions = siteData?.transactions ?? 0;

	// Get estimated payout and transactions from current quarter
	const currentQuarterEstimate =
		woopaymentsData?.data?.estimated?.current_quarter?.sites?.[ siteId ]?.payout ?? 0;
	const currentQuarterTransactions =
		woopaymentsData?.data?.estimated?.current_quarter?.sites?.[ siteId ]?.transactions ?? 0;

	// Get estimated payout and transactions from previous quarter
	const previousQuarterEstimate =
		woopaymentsData?.data?.estimated?.previous_quarter?.sites?.[ siteId ]?.payout ?? 0;
	const previousQuarterTransactions =
		woopaymentsData?.data?.estimated?.previous_quarter?.sites?.[ siteId ]?.transactions ?? 0;

	// If next and current payout dates are not equal, add previous quarter estimate
	const now = new Date();
	const isCurrentQuarterOnly = areNextAndCurrentPayoutDatesEqual( now );

	const estimatedPayout = isCurrentQuarterOnly
		? currentQuarterEstimate
		: currentQuarterEstimate + previousQuarterEstimate;

	// Include estimated transactions from both quarters
	const estimatedTransactions = isCurrentQuarterOnly
		? currentQuarterTransactions
		: currentQuarterTransactions + previousQuarterTransactions;

	// Total transactions includes both completed and estimated transactions
	const transactions = totalTransactions + estimatedTransactions;

	return {
		transactions,
		payout: sitePayout,
		estimatedPayout,
	};
};
