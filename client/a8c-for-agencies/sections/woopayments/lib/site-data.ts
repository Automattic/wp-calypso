import { WooPaymentsData } from '../types';

interface WooPaymentsSiteData {
	transactions: number | null;
	payout: number | null;
}

export const getSiteData = (
	woopaymentsData: WooPaymentsData,
	siteId: number
): WooPaymentsSiteData => ( {
	transactions: woopaymentsData?.data?.total?.sites?.[ siteId ]?.transactions ?? 0,
	payout: woopaymentsData?.data?.total?.sites?.[ siteId ]?.payout ?? 0,
} );
