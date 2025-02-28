interface WooPaymentsSiteData {
	transactions: number | null;
	payout: number | null;
}

interface WooPaymentsData {
	total?: {
		sites?: {
			[ key: number ]: {
				tpv?: number;
				payout?: number;
			};
		};
	};
}

export const getSiteData = (
	woopaymentsData: WooPaymentsData,
	siteId: number
): WooPaymentsSiteData => ( {
	transactions: woopaymentsData?.total?.sites?.[ siteId ]?.tpv ?? 0,
	payout: woopaymentsData?.total?.sites?.[ siteId ]?.payout ?? 0,
} );
