import { useTranslate } from 'i18n-calypso';

export default function useMarketplaceWalkthroughTour() {
	const translate = useTranslate();

	return [
		// {
		// 	id: 'hosting-overview-v3-navigation',
		// 	popoverPosition: 'right',
		// 	title: translate( 'Browse hosting and products' ),
		// 	description: translate( 'Save on hosting and product bundles via Automattic from Agencies.' ),
		// },
		{
			id: 'hosting-overview-v3-referral-toggle',
			popoverPosition: 'bottom',
			title: translate( 'Earn money when you refer our hosting and products to clients' ),
			description: translate(
				'Assemble a cart, send a request for payment to your clients, and earn commissions.'
			),
		},
	];
}
