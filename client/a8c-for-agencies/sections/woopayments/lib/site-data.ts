import { WooPaymentsData } from '../types';

interface WooPaymentsSiteData {
	transactions: number | null;
	payout: number | null;
}

export const getSiteData = (
	woopaymentsData: WooPaymentsData,
	siteId: number
): WooPaymentsSiteData => ( {
	transactions: woopaymentsData?.total?.sites?.[ siteId ]?.tpv ?? 0,
	payout: woopaymentsData?.total?.sites?.[ siteId ]?.payout ?? 0,
} );
