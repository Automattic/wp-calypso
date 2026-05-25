import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import useHelpCenter from 'calypso/a8c-for-agencies/hooks/use-help-center';
import { preventWidows } from 'calypso/lib/formatting/prevent-widows';

export default function useMarketplaceWalkthroughTour() {
	const translate = useTranslate();
	const { showSupportGuide } = useHelpCenter();

	return [
		{
			id: 'marketplace-walkthrough-navigation',
			popoverPosition: 'right',
			title: translate( 'Browse hosting and products' ),
			description: translate( 'Save on hosting and product bundles via Automattic for Agencies.' ),
		},
		{
			id: 'marketplace-walkthrough-referral-toggle',
			popoverPosition: 'bottom',
			title: translate( 'Earn money when you refer our hosting and products to clients' ),
			description: preventWidows(
				translate(
					'Assemble a cart, send a request for payment to your clients, and earn commissions. {{a}}Learn more{{/a}}',
					{
						components: {
							a: (
								<Button
									variant="link"
									onClick={ () =>
										showSupportGuide(
											'https://agencieshelp.automattic.com/knowledge-base/referring-products-to-clients'
										)
									}
								/>
							),
						},
					}
				)
			),
		},
	];
}
