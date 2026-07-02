import { areNextAndCurrentPayoutDatesEqual } from './payout-dates';
import type { AgencyWooPaymentsData } from '@automattic/api-core';

export const getSiteData = (
	woopaymentsData: AgencyWooPaymentsData | undefined,
	siteId: number
): { transactions: number; payout: number; estimatedPayout: number } => {
	const siteData = woopaymentsData?.data?.total?.sites?.[ siteId ];
	const sitePayout = siteData?.payout ?? 0;
	const totalTransactions = siteData?.transactions ?? 0;

	const currentQuarterEstimate =
		woopaymentsData?.data?.estimated?.current_quarter?.sites?.[ siteId ]?.payout ?? 0;
	const currentQuarterTransactions =
		woopaymentsData?.data?.estimated?.current_quarter?.sites?.[ siteId ]?.transactions ?? 0;
	const previousQuarterEstimate =
		woopaymentsData?.data?.estimated?.previous_quarter?.sites?.[ siteId ]?.payout ?? 0;
	const previousQuarterTransactions =
		woopaymentsData?.data?.estimated?.previous_quarter?.sites?.[ siteId ]?.transactions ?? 0;

	const now = new Date();
	const isCurrentQuarterOnly = areNextAndCurrentPayoutDatesEqual( now );

	const estimatedPayout = isCurrentQuarterOnly
		? currentQuarterEstimate
		: currentQuarterEstimate + previousQuarterEstimate;
	const estimatedTransactions = isCurrentQuarterOnly
		? currentQuarterTransactions
		: currentQuarterTransactions + previousQuarterTransactions;

	return {
		transactions: totalTransactions + estimatedTransactions,
		payout: sitePayout,
		estimatedPayout,
	};
};
