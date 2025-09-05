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

	// Get estimated payout directly from current quarter site data
	const estimatedPayout =
		woopaymentsData?.data?.estimated?.current_quarter?.sites?.[ siteId ]?.payout ?? 0;

	return {
		transactions: siteTransactions,
		payout: sitePayout,
		estimatedPayout,
	};
};
